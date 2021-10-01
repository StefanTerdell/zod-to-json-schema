import { ZodSchema } from "zod";
import { JsonSchema7Type, parseDef } from "./parseDef";
import { $refStrategy, EffectStrategy, References } from "./References";

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
      $schema: typeof $schema;
      $ref: `#/definitions/${Name}`;
      definitions: Record<Name, JsonSchema7Type>;
    }
  : { $schema: typeof $schema } & JsonSchema7Type;

/**
 *
 * @param schema (ZodSchema) The Zod schema to be converted to a JSON schema.
 * @param options (Object) The (optional) options object.
 * @param options.name (string) The (optional) name of the schema. If provided, schema will be put in definitions/{name}
 * @param options.$refStrategy ("root" | "relative" | "none") The (optional) reference builder strategy. Default: "root"
 * @param options.basePath (string[]) The (optional) basePath for the root reference builder strategy. Default: [#]
 * @param options.effectStrategy ("input" | "any") The (optional) effect resolver strategy. Default: "input"
 *
 */
function zodToJsonSchema<
  Name extends string | undefined = undefined,
  Strategy extends "root" | "relative" | "none" | undefined = undefined,
  BasePath extends string[] | undefined = undefined
>(
  schema: ZodSchema<any>,
  options?: {
    name?: Name;
    $refStrategy?: Strategy;
    basePath?: BasePath;
    effectStrategy?: EffectStrategy;
  }
): Name extends string
  ? BasePath extends string[]
    ? {
        $schema: typeof $schema;
        $ref: string;
        definitions: Record<Name, JsonSchema7Type>;
      }
    : Strategy extends "relative"
    ? {
        $schema: typeof $schema;
        $ref: `0/definitions/${Name}`;
        definitions: Record<Name, JsonSchema7Type>;
      }
    : {
        $schema: typeof $schema;
        $ref: `#/definitions/${Name}`;
        definitions: Record<Name, JsonSchema7Type>;
      }
  : { $schema: typeof $schema } & JsonSchema7Type;

function zodToJsonSchema(
  schema: ZodSchema<any>,
  options?:
    | {
        name?: string;
        $refStrategy?: $refStrategy;
        basePath?: string[];
        effectStrategy?: EffectStrategy;
      }
    | string
) {
  if (typeof options === "object") {
    return options.name === undefined
      ? {
          $schema,
          ...parseDef(
            schema._def,
            new References(
              options.basePath ?? ["#"],
              [],
              options.$refStrategy ?? "root",
              options.effectStrategy
            )
          ),
        }
      : {
          $schema,
          $ref:
            options.$refStrategy === "relative"
              ? `0/definitions/${options.name}`
              : `#/definitions/${options.name}`,
          definitions: {
            [options.name]:
              parseDef(
                schema._def,
                new References(
                  [...(options.basePath ?? []), "definitions", options.name],
                  [],
                  options.$refStrategy ?? "root",
                  options.effectStrategy
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
