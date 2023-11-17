import { ZodDefaultDef } from "zod"
import { parseDef } from "../parseDef.js"
import { Refs } from "../Refs.js"
import { JsonSchema } from "../JsonSchema.js"

export function parseDefaultDef(
  _def: ZodDefaultDef,
  refs: Refs,
): (JsonSchema & { default: any }) | false {
  const inner = parseDef(_def.innerType._def, refs)

  return typeof inner === "object"
    ? {
        ...inner,
        default: _def.defaultValue(),
      }
    : inner
    ? { default: _def.defaultValue() }
    : false
}
