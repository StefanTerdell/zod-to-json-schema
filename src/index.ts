import { Schema, ZodDef, ZodTypeDef, ZodTypes } from 'zod';
import { JSONSchema7 } from 'json-schema';

/**
 * @param schemas A record of the Zod schemas to be converted to Json schemas, for example {mySchema: z.object({stuff: z.any()})}
 * @param pathing Replaces already resolved schemas with a $ref.
 * - 'full' will resolve paths between all passed schemas
 * - 'perSchema' will only resolve paths internaly
 * - 'none' will completely ignore that schemas have already been seen. This is may cause recursion errors. @default full
 * @param flatten If true and a single schema is passed, a 'definitions' property will not be created and the schema will be spread directly in the base object
 */
const toJsonSchema = (schemas: Record<string, Schema<any>>, pathing: 'full' | 'perSchema' | 'none' = 'full', flatten: boolean = false): JSONSchema7 => {
  const base: JSONSchema7 = {
    $schema: 'http://json-schema.org/draft-07/schema#',
  };

  if (Object.keys(schemas).length === 1) {
    if (flatten) {
      return {
        ...base,
        ...parse(Object.values(schemas)[0]._def, [], pathing === 'none' ? undefined : []),
      };
    } else {
      return {
        ...base,
        $ref: `#/definitions/${Object.keys(schemas)[0]}`,
        definitions: {
          [Object.keys(schemas)[0]]: parse(Object.values(schemas)[0]._def, ['definitions', Object.keys(schemas)[0]], pathing === 'none' ? undefined : []),
        },
      };
    }
  } else {
    const visited = [];
    return {
      ...base,
      definitions: Object.fromEntries(
        Object.entries(schemas).map(([key, value]) => [
          key,
          parse(value._def, ['definitions', key], pathing === 'full' ? visited : 'perSchema' ? [] : undefined),
        ])
      ),
    };
  }
};

export default toJsonSchema;
export { toJsonSchema };

const parse = (schemaDef: ZodTypeDef, path: string[], visited?: { def: ZodTypeDef; path: string[] }[]): JSONSchema7 | undefined => {
  if (visited) {
    const seen = visited.find((x) => Object.is(x.def, schemaDef));
    if (seen) {
      return { $ref: `#/${seen.path.join('/')}` };
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
        properties: Object.fromEntries(
          Object.entries(def.shape())
            .map(([key, value]) => [key, parse(value._def, [...path, 'properties', key], visited)])
            .filter(([, v]) => v !== undefined)
        ),
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

      if (required.length) result.required = required;

      return result;
    case ZodTypes.union:
      const options = def.options.filter((x) => x._def.t !== 'undefined');

      if (options.length === 1) return parse(options[0]._def, path, visited); // likely union with undefined, and thus probably optional object property

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

      // Fallback to verbose anyOf. This will always work schematically but it does get quite ugly at times.
      return {
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
      if (parsedType !== 'bigint' && parsedType !== 'number' && parsedType !== 'boolean' && parsedType !== 'string') throw 'Unsupported literal type';
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
