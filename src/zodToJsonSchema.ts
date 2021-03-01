import { Schema } from 'zod';
import { JsonSchema7Type, parseDef } from './parseDef';

/**
 * @param schema The Zod schema to be converted
 */
function zodToJsonSchema(
  schema: Schema<any>
): {
  $schema: 'http://json-schema.org/draft-07/schema#';
} & JsonSchema7Type;
/**
 * @param schema The Zod schema to be converted
 * @param name The (optional) name of the schema. If a name is passed, the schema will be put in 'definitions' and referenced from the root.
 */
function zodToJsonSchema<T extends string>(
  schema: Schema<any>,
  name: T
): {
  $schema: 'http://json-schema.org/draft-07/schema#';
  $ref: string;
  definitions: Record<T, JsonSchema7Type>;
};
function zodToJsonSchema(schema: Schema<any>, name?: string) {
  return name === undefined
    ? {
        $schema: 'http://json-schema.org/draft-07/schema#',
        ...parseDef(schema._def, [], []),
      }
    : {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $ref: `#/definitions/${name}`,
        definitions: { [name]: parseDef(schema._def, ['definitions', name], []) || {} },
      };
}

export { zodToJsonSchema };
