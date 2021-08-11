import { ZodSchema } from "zod";
import { JsonSchema7Type, parseDef } from "./parseDef";

type JsonSchema7Definitions = { [key: string]: JsonSchema7Type };

/**
 * @param schema The Zod schema to be converted
 */
function zodToJsonSchema(
  schema: ZodSchema<any>
): {
  $schema: "http://json-schema.org/draft-07/schema#";
} & JsonSchema7Type;
/**
 * @param schema The Zod schema to be converted
 * @param name The (optional) name of the schema. If a name is passed, the schema will be put in 'definitions' and referenced from the root.
 */
function zodToJsonSchema<Name extends string>(
  schema: ZodSchema<any>,
  name: Name
): {
  $schema: "http://json-schema.org/draft-07/schema#";
  $ref: `#/definitions/${Name}`;
  definitions: JsonSchema7Definitions;
};
function zodToJsonSchema(schema: ZodSchema<any>, name?: string) {
  return name === undefined
    ? {
        $schema: "http://json-schema.org/draft-07/schema#",
        ...parseDef(schema, [], []),
      }
    : {
        $schema: "http://json-schema.org/draft-07/schema#",
        $ref: `#/definitions/${name}`,
        definitions: {
          [name]: parseDef(schema, ["definitions", name], []) || {},
        },
      };
}

export { zodToJsonSchema };
