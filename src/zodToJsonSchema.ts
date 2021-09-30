import { z, ZodSchema } from "zod";
import { JsonSchema7Type, parseDef } from "./parseDef";
import { $refStrategy, References } from "./References";

const $schema = "http://json-schema.org/draft-07/schema#";

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
  $schema: typeof $schema;
} & JsonSchema7Type;

function zodToJsonSchema<Name extends string>(
  schema: ZodSchema<any>,
  name: Name
): {
  $schema: typeof $schema;
  $ref: `#/definitions/${Name}`;
  definitions: Record<Name, JsonSchema7Type>;
};

function zodToJsonSchema<Name extends undefined>(
  schema: ZodSchema<any>,
  options: ZodToJsonSchemaOptions<Name, $refStrategy, string[]>
): {
  $schema: typeof $schema;
} & JsonSchema7Type;

function zodToJsonSchema<
  Name extends string,
  $refStrategy extends "root" | "none" | undefined,
  BasePath extends undefined
>(
  schema: ZodSchema<any>,
  options: ZodToJsonSchemaOptions<Name, $refStrategy, BasePath>
): {
  $schema: typeof $schema;
  $ref: `#/definitions/${Name}`;
  definitions: Record<Name, JsonSchema7Type>;
};

function zodToJsonSchema<
  Name extends string,
  $refStrategy extends "relative",
  BasePath extends undefined
>(
  schema: ZodSchema<any>,
  options: ZodToJsonSchemaOptions<Name, $refStrategy, BasePath>
): {
  $schema: typeof $schema;
  $ref: `0/definitions/${Name}`;
  definitions: Record<Name, JsonSchema7Type>;
};

function zodToJsonSchema<Name extends string, Path extends string[]>(
  schema: ZodSchema<any>,
  options: ZodToJsonSchemaOptions<Name, $refStrategy, Path>
): {
  $schema: typeof $schema;
  $ref: string;
  definitions: Record<Name, JsonSchema7Type>;
};

function zodToJsonSchema(
  schema: ZodSchema<any>,
  options?: Partial<ZodToJsonSchemaOptions<string, $refStrategy, string[]>>
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
    return {
      $schema,
      $ref: `#/definitions/${options}`,
      definitions: {
        [options]: parseDef(schema._def, new References()) || {},
      },
    };
  } else {
    return {
      $schema,
      ...parseDef(schema._def, new References()),
    };
  }
}

const nameOnly = zodToJsonSchema(z.any(), "hej");
const nameOnlyOpt = zodToJsonSchema(z.any(), { name: "hej" });

const noName = zodToJsonSchema(z.any());

const noNamePath = zodToJsonSchema(z.any(), { basePath: ["lol"] });
const noNameRel = zodToJsonSchema(z.any(), { $refStrategy: "relative" });
const noNameRoot = zodToJsonSchema(z.any(), { $refStrategy: "root" });
const noNameNone = zodToJsonSchema(z.any(), { $refStrategy: "none" });
const noNamePathRel = zodToJsonSchema(z.any(), {
  basePath: ["lol"],
  $refStrategy: "relative",
});
const noNamePathRoot = zodToJsonSchema(z.any(), {
  basePath: ["lol"],
  $refStrategy: "root",
});
const noNamePathNone = zodToJsonSchema(z.any(), {
  basePath: ["lol"],
  $refStrategy: "none",
});

const namePath = zodToJsonSchema(z.any(), { name: "hej", basePath: ["lol"] });
const nameRel = zodToJsonSchema(z.any(), {
  name: "hej",
  $refStrategy: "relative",
});
const nameRoot = zodToJsonSchema(z.any(), {
  name: "hej",
  $refStrategy: "root",
});
const nameNone = zodToJsonSchema(z.any(), {
  name: "hej",
  $refStrategy: "none",
});
const namePathRel = zodToJsonSchema(z.any(), {
  name: "hej",
  basePath: ["lol"],
  $refStrategy: "relative",
});
const namePathRoot = zodToJsonSchema(z.any(), {
  name: "hej",
  basePath: ["lol"],
  $refStrategy: "root",
});
const namePathNone = zodToJsonSchema(z.any(), {
  name: "hej",
  basePath: ["lol"],
  $refStrategy: "none",
});

export { zodToJsonSchema };

