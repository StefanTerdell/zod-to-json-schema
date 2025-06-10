import { ZodMapDef } from "zod";
import { parseDef } from "../parseDef.js";
import { parseRecordDef } from "./record.js";
import { DefParser, ensureObjectSchema } from "../parseTypes.js";

export const parseMapDef: DefParser<ZodMapDef> = (def, refs) => {
  if (refs.mapStrategy === "record") {
    return parseRecordDef(def, refs);
  }

  const keys =
    ensureObjectSchema(
      parseDef(def.keyType._def, {
        ...refs,
        currentPath: [...refs.currentPath, "items", "items", "0"],
      }),
    ) ?? {};

  const values =
    ensureObjectSchema(
      parseDef(def.valueType._def, {
        ...refs,
        currentPath: [...refs.currentPath, "items", "items", "1"],
      }),
    ) ?? {};

  return {
    type: "array",
    maxItems: 125,
    items: {
      type: "array",
      prefixItems: [keys, values],
      minItems: 2,
      maxItems: 2,
    },
  };
};
