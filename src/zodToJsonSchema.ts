import { ZodSchema } from "zod";
import { Options } from "./Options";
import { JsonSchema7Type, parseDef } from "./parseDef";
import { getRefs } from "./Refs";

const zodToJsonSchema = <
  Target extends "jsonSchema7" | "openApi3" = "jsonSchema7"
>(
  schema: ZodSchema<any>,
  options?: Partial<Options<Target>> | string
): (Target extends "jsonSchema7" ? JsonSchema7Type : object) & {
  $schema?: string;
  definitions?: {
    [key: string]: Target extends "jsonSchema7" ? JsonSchema7Type : object;
  };
} => {
  const refs = getRefs(options);

  const definitions =
    typeof options === "object" && options.definitions
      ? Object.entries(options.definitions).reduce(
          (acc, [name, schema]) => ({
            ...acc,
            [name]:
              parseDef(
                schema._def,
                {
                  ...refs,
                  currentPath: [...refs.basePath, refs.definitionPath, name],
                },
                true
              ) ?? {},
          }),
          {}
        )
      : undefined;

  const name = typeof options === "string" ? options : options?.name;

  const main =
    parseDef(
      schema._def,
      name === undefined
        ? refs
        : {
            ...refs,
            currentPath: [...refs.basePath, refs.definitionPath, name],
          }
    ) ?? {};

  const combined: ReturnType<typeof zodToJsonSchema<Target>> =
    name === undefined
      ? definitions
        ? {
            ...main,
            [refs.definitionPath]: definitions,
          }
        : main
      : {
          $ref: [
            ...(refs.$refStrategy === "relative" ? [] : refs.basePath),
            refs.definitionPath,
            name,
          ].join("/"),
          [refs.definitionPath]: {
            ...definitions,
            [name]: main,
          },
        };

  if (refs.target === "jsonSchema7") {
    combined.$schema = "http://json-schema.org/draft-07/schema#";
  }

  return combined;
};

export { zodToJsonSchema };
