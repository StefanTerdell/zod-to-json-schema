import { ZodBrandedDef, ZodTypeAny } from "zod";
import { parseDef } from "../parseDef.js";
import { DefParser } from "../parseTypes.js";

export const parseBrandedDef: DefParser<ZodBrandedDef<ZodTypeAny>, true> = (
  def,
  refs,
) => {
  return parseDef(def.type._def, refs);
};
