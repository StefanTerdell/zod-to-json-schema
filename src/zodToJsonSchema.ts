import { ZodSchema } from "zod";
import { JsonSchema7Type, parseDef } from "./parseDef";
import { $refStrategy, EffectStrategy, Target, References } from "./References";

const $schema = "http://json-schema.org/draft-07/schema#";

/**
 *
 * @param schema (ZodSchema) The Zod schema to be converted to a JSON schema.
 * @param name (string) The (optional) name of the schema. If provided, schema will be put in definitions/{name}
 */
function zodToJsonSchema<Name extends string | undefined = undefined>(
  schema: ZodSchema<any>,
  name?: Name
): Name extends string
  ? {
      $schema: "http://json-schema.org/draft-07/schema#";
      $ref: `#/definitions/${Name}`;
      definitions: Record<Name, JsonSchema7Type>;
    }
  : { $schema: "http://json-schema.org/draft-07/schema#" } & JsonSchema7Type;

/**
 *
 * @param schema (ZodSchema) The Zod schema to be converted to a JSON schema.
 * @param options (Object) The (optional) options object.
 * @param options.name (string) The (optional) name of the schema. If provided, schema will be put in definitions/{name}
 * @param options.$refStrategy ("root" | "relative" | "none") The (optional) reference builder strategy. Default: "root"
 * @param options.basePath (string[]) The (optional) basePath for the root reference builder strategy. Default: [#]
 * @param options.effectStrategy ("input" | "any") The (optional) effect resolver strategy. Default: "input"
 * @param options.definitionPath ("definitions" | "$defs") defaults to definitions.
 * @param options.target ("jsonSchema" | "openApi") defaults to "jsonSchema"
 *
 */
function zodToJsonSchema<
  Name extends string | undefined = undefined,
  Strategy extends "root" | "relative" | "none" | undefined = undefined,
  BasePath extends string[] | undefined = undefined,
  DefinitionPath extends "definitions" | "$defs" = "definitions",
  Target extends "jsonSchema" | "openApi" | undefined = undefined
>(
  schema: ZodSchema<any>,
  options?: {
    name?: Name;
    $refStrategy?: Strategy;
    basePath?: BasePath;
    effectStrategy?: EffectStrategy;
    definitionPath?: DefinitionPath;
    target?: Target;
  }
): Target extends "openApi"
  ? Name extends string
    ? BasePath extends string[]
      ? {
          $ref: string;
        } & Record<DefinitionPath, Record<Name, JsonSchema7Type>>
      : Strategy extends "relative"
      ? {
          $ref: `0/${DefinitionPath}/${Name}`;
        } & Record<DefinitionPath, Record<Name, JsonSchema7Type>>
      : {
          $ref: `#/${DefinitionPath}/${Name}`;
        } & Record<DefinitionPath, Record<Name, JsonSchema7Type>>
    : JsonSchema7Type
  : Name extends string
  ? BasePath extends string[]
    ? {
        $schema: "http://json-schema.org/draft-07/schema#";
        $ref: string;
      } & Record<DefinitionPath, Record<Name, JsonSchema7Type>>
    : Strategy extends "relative"
    ? {
        $schema: "http://json-schema.org/draft-07/schema#";
        $ref: `0/${DefinitionPath}/${Name}`;
      } & Record<DefinitionPath, Record<Name, JsonSchema7Type>>
    : {
        $schema: "http://json-schema.org/draft-07/schema#";
        $ref: `#/${DefinitionPath}/${Name}`;
      } & Record<DefinitionPath, Record<Name, JsonSchema7Type>>
  : { $schema: "http://json-schema.org/draft-07/schema#" } & JsonSchema7Type;

function zodToJsonSchema(
  schema: ZodSchema<any>,
  options?:
    | {
        name?: string;
        $refStrategy?: $refStrategy;
        basePath?: string[];
        effectStrategy?: EffectStrategy;
        definitionPath?: "definitions" | "$defs";
        target?: Target;
      }
    | string
) {
  if (typeof options === "object") {
    return options.name === undefined
      ? options.target === "openApi"
        ? parseDef(
            schema._def,
            new References(
              options.basePath ?? ["#"],
              [],
              options.$refStrategy ?? "root",
              options.effectStrategy,
              options.target
            )
          )
        : {
            $schema,
            ...parseDef(
              schema._def,
              new References(
                options.basePath ?? ["#"],
                [],
                options.$refStrategy ?? "root",
                options.effectStrategy,
                options.target
              )
            ),
          }
      : options.target === "openApi"
      ? {
          $ref:
            options.$refStrategy === "relative"
              ? `0/${options.definitionPath ?? "definitions"}/${options.name}`
              : `#/${options.definitionPath ?? "definitions"}/${options.name}`,
          [options.definitionPath ?? "definitions"]: {
            [options.name]:
              parseDef(
                schema._def,
                new References(
                  [
                    ...(options.basePath ?? ["#"]),
                    options.definitionPath ?? "definitions",
                    options.name,
                  ],
                  [],
                  options.$refStrategy ?? "root",
                  options.effectStrategy,
                  options.target
                )
              ) || {},
          },
        }
      : {
          $schema,
          $ref:
            options.$refStrategy === "relative"
              ? `0/${options.definitionPath ?? "definitions"}/${options.name}`
              : `#/${options.definitionPath ?? "definitions"}/${options.name}`,
          [options.definitionPath ?? "definitions"]: {
            [options.name]:
              parseDef(
                schema._def,
                new References(
                  [
                    ...(options.basePath ?? ["#"]),
                    options.definitionPath ?? "definitions",
                    options.name,
                  ],
                  [],
                  options.$refStrategy ?? "root",
                  options.effectStrategy,
                  options.target
                )
              ) || {},
          },
        };
  } else if (typeof options === "string") {
    const name = options;
    return {
      $schema,
      $ref: `#/definitions/${name}`,
      definitions: {
        [name]: parseDef(schema._def, new References()) || {},
      },
    };
  } else {
    return {
      $schema,
      ...parseDef(schema._def, new References()),
    };
  }
}

export { zodToJsonSchema };
