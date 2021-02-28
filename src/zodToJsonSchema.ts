import { Schema } from 'zod';
import { JsonSchema7Type, parseDef } from './parseDef';

export type JsonSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#';
} & (
  | {
      $ref: string;
      definitions: Record<string, JsonSchema7Type>;
    }
  | JsonSchema7Type
);

/**
 * @param schema The Zod schema to be converted
 * @param name The (optional) name of the schema. If a name is passed, the schema will be put in 'definitions' and referenced from the root.
 */
export function zodToJsonSchema(schema: Schema<any>, name?: string): JsonSchema7 {
  return name
    ? {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $ref: `#/definitions/${name}`,
        definitions: { [name]: parseDef(schema._def, ['definitions', name], []) },
      }
    : {
        $schema: 'http://json-schema.org/draft-07/schema#',
        ...parseDef(schema._def, [], []),
      };
}
