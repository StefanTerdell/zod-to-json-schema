import { ZodMapDef } from "zod"
import { parseDef } from "../parseDef.js"
import { Refs } from "../Refs.js"
import { parseRecordDef } from "./record.js"
import { JsonSchema } from "../JsonSchema.js"

export function parseMapDef(def: ZodMapDef, refs: Refs): JsonSchema {
  if (refs.mapStrategy === "record") {
    return parseRecordDef(def, refs)
  }

  const keys =
    parseDef(def.keyType._def, {
      ...refs,
      currentPath: [...refs.currentPath, "items", "items", "0"],
    }) || {}
  const values =
    parseDef(def.valueType._def, {
      ...refs,
      currentPath: [...refs.currentPath, "items", "items", "1"],
    }) || {}
  return {
    type: "array",
    maxItems: 125,
    items: {
      type: "array",
      items: [keys, values],
      minItems: 2,
      maxItems: 2,
    },
  }
}
