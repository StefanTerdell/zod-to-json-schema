import { ZodOptionalDef } from "zod";
import { parseDef } from "../parseDef.js";
import { DefParser } from "../parseTypes.js";

export const parseOptionalDef: DefParser<ZodOptionalDef, true> = (
  def,
  refs,
) => {
  if (refs.currentPath.toString() === refs.propertyPath?.toString()) {
    return parseDef(def.innerType._def, refs);
  }

  const innerSchema = parseDef(def.innerType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "anyOf", "1"],
  });

  if (innerSchema === null) {
    return null;
  }

  if (typeof innerSchema === "boolean") {
    return innerSchema;
  }

  return {
    anyOf: [{ not: {} }, innerSchema],
  };
};
