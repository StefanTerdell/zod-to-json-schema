import { ZodPipelineDef } from "zod"
import { parseDef } from "../parseDef.js"
import { Refs } from "../Refs.js"
import { JsonSchema } from "../JsonSchema.js"

export const parsePipelineDef = (
  def: ZodPipelineDef<any, any>,
  refs: Refs,
): JsonSchema | undefined => {
  if (refs.pipeStrategy === "input") {
    return parseDef(def.in._def, refs)
  }

  const a = parseDef(def.in._def, {
    ...refs,
    currentPath: [...refs.currentPath, "allOf", "0"],
  })
  const b = parseDef(def.out._def, {
    ...refs,
    currentPath: [...refs.currentPath, "allOf", a ? "1" : "0"],
  })

  return {
    allOf: [a, b].filter((x): x is JsonSchema => x !== undefined),
  }
}
