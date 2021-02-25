import { Schema, ZodDef, ZodTypeDef, ZodTypes } from 'zod';
import { JSONSchema7 } from 'json-schema';
/**
 * @param schema The Zod schema to be converted
 * @param name The (optional) name of the schema. If a name is passed, the schema will be put in 'definitions' and referenced from the root.
 */
const toJsonSchema = (schema: Schema<any>, name?: string): JSONSchema7 => {
  return name
    ? {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $ref: `#/definitions/${name}`,
        definitions: { [name]: parse(schema._def, ['definitions', name], []) },
      }
    : {
        $schema: 'http://json-schema.org/draft-07/schema#',
        ...parse(schema._def, [], []),
      };
};
export default toJsonSchema;
export { toJsonSchema };
const parse = (schemaDef: ZodTypeDef, path: string[], visited: { def: ZodTypeDef; path: string[] }[]): JSONSchema7 | null => {
  if (visited) {
    const wasVisited = visited.find((x) => Object.is(x.def, schemaDef));
    if (wasVisited) {
      return { $ref: `#/${wasVisited.path.join('/')}` };
    } else {
      visited.push({ def: schemaDef, path });
    }
  }
  const def: ZodDef = schemaDef as any;
  switch (def.t) {
    case ZodTypes.string:
      return {
        type: 'string',
      };
    case ZodTypes.number:
      return {
        type: 'number',
      };
    case ZodTypes.bigint:
      return {
        type: 'integer',
      };
    case ZodTypes.boolean:
      return {
        type: 'boolean',
      };
    case ZodTypes.date:
      return {
        type: 'string',
      };
    case ZodTypes.undefined:
      return {
        not: {},
      };
    case ZodTypes.null:
      return {
        type: 'null',
      };
    case ZodTypes.array:
      return {
        type: 'array',
        items: parse(def.type._def, [...path, 'items'], visited),
      };
    case ZodTypes.object:
      const result: JSONSchema7 = {
        type: 'object',
        properties: Object.entries(def.shape())
          .map(([key, value]) => ({ key, value: parse(value._def, [...path, 'properties', key], visited) }))
          .filter(({ value }) => value !== undefined)
          .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {}),
        additionalProperties: !def.params.strict,
      };
      const required = Object.entries(def.shape())
        .filter(
          ([key, value]) =>
            Object.keys(result.properties).includes(key) &&
            value._def.t !== 'undefined' &&
            (value._def.t !== 'union' || !value._def.options.find((x) => x._def.t === 'undefined'))
        )
        .map(([key]) => key);
      if (required.length) {
        result.required = required;
      }
      return result;
    case ZodTypes.union:
      const options = def.options.filter((x) => x._def.t !== 'undefined');
      if (options.length === 1) {
        return parse(options[0]._def, path, visited); // likely union with undefined, and thus probably optional object property
      }
      // This blocks tries to look ahead a bit to produce nicer looking schemas with type joining instead of anyOf.
      // Might get a bit complex when I get to validations so dont count on it sticking around.
      if (options.every((x) => ['string', 'number', 'bigint', 'boolean', 'null'].includes(x._def.t))) {
        // all types in union are primitive, so might as well squash into {type: [...]}
        const types = options
          .reduce((types, option) => (types.includes(option._def.t) ? types : [...types, option._def.t]), [] as string[])
          .map((x) => (x === 'bigint' ? 'integer' : x));
        return {
          type: types.length > 1 ? types : types[0],
        };
      } else if (options.every((x) => x._def.t === 'literal')) {
        // all options literals
        const types = options
          .reduce((types, option) => (types.includes(typeof option._def.value) ? types : [...types, typeof option._def.value]), [])
          .map((x) => (x === 'bigint' ? 'integer' : x));

        if (types.every((x) => ['string', 'number', 'integer', 'boolean', 'null'].includes(x))) {
          // all the literals are primitive
          return {
            type: types.length > 1 ? types : types[0],
            enum: options.map((x) => x._def.value),
          };
        }
      }
      return {
        // Fallback to verbose anyOf. This will always work schematically but it does get quite ugly at times.
        anyOf: options.map((x, i) => parse(x._def, [...path, i.toString()], visited)),
      };
    case ZodTypes.intersection:
      const right = parse(def.right._def, path, visited);
      if (right.type === 'object' && typeof right.properties === 'object') {
        const left = parse(def.left._def, path, visited);
        if (left.type === 'object' && typeof left.properties === 'object') {
          return {
            type: 'object',
            properties: { ...left.properties, ...right.properties },
            required: [...(left.required || []).filter((x) => !Object.keys(right.properties).includes(x)), ...(right.required || [])],
          };
        }
      }
      return right;
    case ZodTypes.tuple:
      return {
        type: 'array',
        minItems: def.items.length,
        maxItems: def.items.length,
        items: def.items.map((x, i) => parse(x._def, [...path, 'items', i.toString()], visited)),
      };
    case ZodTypes.record:
      return {
        type: 'object',
        additionalProperties: parse(def.valueType._def, [...path, 'additionalProperties'], visited),
      };
    case ZodTypes.literal:
      const parsedType = typeof def.value;
      if (parsedType !== 'bigint' && parsedType !== 'number' && parsedType !== 'boolean' && parsedType !== 'string') {
        return {};
      }
      return {
        type: parsedType === 'bigint' ? 'integer' : parsedType,
        const: def.value,
      };
    case ZodTypes.enum:
      return {
        type: 'string',
        enum: def.values,
      };
    case ZodTypes.nativeEnum:
      return {};
    case ZodTypes.any:
      return {};
    case ZodTypes.unknown:
      return {};
    case ZodTypes.function:
      return undefined;
    case ZodTypes.lazy:
      return undefined;
    case ZodTypes.promise:
      return undefined;
    case ZodTypes.void:
      return undefined;
    default:
      return ((_: never) => undefined)(def);
  }
};
