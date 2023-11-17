import { ZodSchema } from "zod"
import { Options, Targets } from "./Options.js"
import { parseDef } from "./parseDef.js"
import { getRefs } from "./Refs.js"
import { JsonSchema } from "./JsonSchema.js"
import { JSONSchema4Object } from "json-schema"

const zodToJsonSchema = <Target extends Targets = "jsonSchema7">(
  schema: ZodSchema<any>,
  options?: Partial<Options<Target>> | string,
): (Target extends "jsonSchema7" ? JsonSchema : object) & {
  $schema?: string
  definitions?: {
    [key: string]: Target extends "jsonSchema7"
      ? JsonSchema
      : Target extends "jsonSchema2019-09"
      ? JsonSchema
      : object
  }
} => {
  const refs = getRefs(options)

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
                true,
              ) ?? {},
          }),
          {},
        )
      : undefined

  const name = typeof options === "string" ? options : options?.name

  const result =
    parseDef(
      schema._def,
      name === undefined
        ? refs
        : {
            ...refs,
            currentPath: [...refs.basePath, refs.definitionPath, name],
          },
      false,
    ) ?? {}

  const resultObject: JSONSchema4Object =
    typeof result === "object" ? result : result ? {} : { not: {} }

  const combined: ReturnType<typeof zodToJsonSchema<Target>> =
    name === undefined
      ? definitions
        ? {
            ...resultObject,
            [refs.definitionPath]: definitions,
          }
        : resultObject
      : {
          $ref: [
            ...(refs.$refStrategy === "relative" ? [] : refs.basePath),
            refs.definitionPath,
            name,
          ].join("/"),
          [refs.definitionPath]: {
            ...definitions,
            [name]: resultObject,
          },
        }

  if (refs.target === "jsonSchema7") {
    combined.$schema = "http://json-schema.org/draft-07/schema#"
  } else if (refs.target === "jsonSchema2019-09") {
    combined.$schema = "https://json-schema.org/draft/2019-09/schema#"
  }

  return combined
}

export { zodToJsonSchema }
