import { ZodPromiseDef } from "zod"
import { parseDef } from "../parseDef.js"
import { Refs } from "../Refs.js"
import { JsonSchema } from "../JsonSchema.js"

export function parsePromiseDef(
  def: ZodPromiseDef,
  refs: Refs,
): JsonSchema | undefined {
  return parseDef(def.type._def, refs)
}
