import { ZodSchema } from "zod";
import { JsonSchema7Type, parseDef } from "./parseDef";
import { $refStrategy, References } from "./References";

const $schema = "http://json-schema.org/draft-07/schema#";

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

function zodToJsonSchema<
  Strategy extends "root" | "relative" | "none" | undefined = undefined,
  BasePath extends string[] | undefined = undefined,
  Name extends string | undefined = undefined
>(
  schema: ZodSchema<any>,
  options?: { name?: Name; $refStrategy?: Strategy; basePath?: BasePath }
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
    | { name?: string; $refStrategy?: $refStrategy; basePath?: string[] }
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
              options.$refStrategy ?? "root"
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
                  options.$refStrategy ?? "root"
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
