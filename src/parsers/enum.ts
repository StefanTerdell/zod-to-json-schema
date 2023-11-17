import { ZodEnumDef } from "zod"
import { JsonSchema } from "../JsonSchema"

export function parseEnumDef(def: ZodEnumDef): JsonSchema {
  return {
    type: "string",
    enum: def.values,
  }
}
