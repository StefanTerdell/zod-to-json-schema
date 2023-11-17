import { ZodIntersectionDef } from "zod"
import { parseDef } from "../parseDef.js"
import { Refs } from "../Refs.js"
import { JsonSchema, JsonSchemaObject } from "../JsonSchema.js"

const isJsonSchema7AllOfType = (
  type: JsonSchema,
): type is JsonSchemaObject & { allOf: JsonSchema[] } => {
  if (typeof type !== "object") return false
  if ("type" in type && type.type === "string") return false
  return "allOf" in type
}

export function parseIntersectionDef(
  def: ZodIntersectionDef,
  refs: Refs,
): JsonSchema | undefined {
  const allOf = [
    parseDef(def.left._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", "0"],
    }),
    parseDef(def.right._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", "1"],
    }),
  ].filter((x): x is JsonSchema => !!x)

  let unevaluatedProperties=
    refs.target === "jsonSchema2019-09"
      ? { unevaluatedProperties: false }
      : undefined

  const mergedAllOf: JsonSchema[] = []
  // If either of the schemas is an allOf, merge them into a single allOf
  allOf.forEach((schema) => {
    if (isJsonSchema7AllOfType(schema)) {
      mergedAllOf.push(...schema.allOf)
      if (schema.unevaluatedProperties === undefined) {
        // If one of the schemas has no unevaluatedProperties set,
        // the merged schema should also have no unevaluatedProperties set
        unevaluatedProperties = undefined
      }
    } else {
      let nestedSchema: JsonSchema= schema
      if (typeof schema === "object" &&
        "additionalProperties" in schema &&
        schema.additionalProperties === false
      ) {
        const { additionalProperties, ...rest } = schema
        nestedSchema = rest
      } else {
        // As soon as one of the schemas has additionalProperties set not to false, we allow unevaluatedProperties
        unevaluatedProperties = undefined
      }
      mergedAllOf.push(nestedSchema)
    }
  })
  return mergedAllOf.length
    ? {
        allOf: mergedAllOf,
        ...unevaluatedProperties,
      }
    : undefined
}
