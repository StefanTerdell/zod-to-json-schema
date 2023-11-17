import { ZodLiteralDef } from "zod"
import { Refs } from "../Refs.js"
import { JsonSchema } from "../JsonSchema.js"

export function parseLiteralDef(def: ZodLiteralDef, refs: Refs): JsonSchema {
  const parsedType = typeof def.value
  if (
    parsedType !== "bigint" &&
    parsedType !== "number" &&
    parsedType !== "boolean" &&
    parsedType !== "string"
  ) {
    return {
      type: Array.isArray(def.value) ? "array" : "object",
    }
  }

  if (refs.target === "openApi3") {
    return {
      type: parsedType === "bigint" ? "integer" : parsedType,
      enum: [def.value],
    } as any
  }

  return {
    type: parsedType === "bigint" ? "integer" : parsedType,
    const: def.value,
  }
}
