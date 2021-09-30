import { z, ZodSchema } from "zod";
import { JsonSchema7Type, parseDef } from "./parseDef";
import { $refStrategy, References } from "./References";

type ZodToJsonSchemaOptions<
  Name extends string | undefined,
  Strategy extends $refStrategy | undefined,
  Path extends string[] | undefined
> =
  | {
      name?: Name;
      $refStrategy?: Strategy;
      basePath?: Path;
    }
  | Name;

function zodToJsonSchema(schema: ZodSchema<any>): {
  $schema: "http://json-schema.org/draft-07/schema#";
} & JsonSchema7Type;

function zodToJsonSchema<Name extends string>(
  schema: ZodSchema<any>,
  name: Name
): {
  $schema: "http://json-schema.org/draft-07/schema#";
  $ref: `#/definitions/${Name}`;
  definitions: Record<Name, JsonSchema7Type>;
};

function zodToJsonSchema<Name extends undefined>(
  schema: ZodSchema<any>,
  options: ZodToJsonSchemaOptions<Name, $refStrategy, string[]>
): {
  $schema: "http://json-schema.org/draft-07/schema#";
} & JsonSchema7Type;

function zodToJsonSchema<
  Name extends string,
  $refStrategy extends "root" | "none" | undefined,
  basePath extends undefined
>(
  schema: ZodSchema<any>,
  options: ZodToJsonSchemaOptions<Name, $refStrategy, basePath>
): {
  $schema: "http://json-schema.org/draft-07/schema#";
  $ref: `#/definitions/${Name}`;
  definitions: Record<Name, JsonSchema7Type>;
};

function zodToJsonSchema<Name extends string, $refStrategy extends "relative">(
  schema: ZodSchema<any>,
  options: ZodToJsonSchemaOptions<Name, $refStrategy, string[]>
): {
  $schema: "http://json-schema.org/draft-07/schema#";
  $ref: `0/definitions/${Name}`;
  definitions: Record<Name, JsonSchema7Type>;
};

function zodToJsonSchema<Name extends string, Path extends string[]>(
  schema: ZodSchema<any>,
  options: ZodToJsonSchemaOptions<Name, $refStrategy, Path>
): {
  $schema: "http://json-schema.org/draft-07/schema#";
  $ref: string;
  definitions: Record<Name, JsonSchema7Type>;
};

function zodToJsonSchema(
  schema: ZodSchema<any>,
  options?: ZodToJsonSchemaOptions<string, $refStrategy, string[]>
) {
  if (typeof options === "object") {
    return options.name === undefined
      ? {
          $schema: "http://json-schema.org/draft-07/schema#",
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
          $schema: "http://json-schema.org/draft-07/schema#",
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
    return {
      $schema: "http://json-schema.org/draft-07/schema#",
      $ref: `#/definitions/${options}`,
      definitions: {
        [options]: parseDef(schema._def, new References()) || {},
      },
    };
  } else {
    return {
      $schema: "http://json-schema.org/draft-07/schema#",
      ...parseDef(schema._def, new References()),
    };
  }
}

export { zodToJsonSchema };
