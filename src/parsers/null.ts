import { JsonSchema } from "../JsonSchema.js"
import { Refs } from "../Refs.js"

export function parseNullDef(refs: Refs): JsonSchema {
  return refs.target === "openApi3"
    ? ({
        enum: ["null"],
        nullable: true,
      } as any)
    : {
        type: "null",
      }
}
