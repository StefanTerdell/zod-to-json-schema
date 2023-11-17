import { ZodNativeEnumDef } from "zod"
import { JsonSchema } from "../JsonSchema"

export function parseNativeEnumDef(def: ZodNativeEnumDef): JsonSchema {
  const object = def.values
  const actualKeys = Object.keys(def.values).filter((key: string) => {
    return typeof object[object[key]] !== "number"
  })

  const actualValues = actualKeys.map((key: string) => object[key])

  const parsedTypes = Array.from(
    new Set(actualValues.map((values: string | number) => typeof values)),
  )

  return {
    type:
      parsedTypes.length === 1
        ? parsedTypes[0] === "string"
          ? "string"
          : "number"
        : ["string", "number"],
    enum: actualValues,
  }
}
