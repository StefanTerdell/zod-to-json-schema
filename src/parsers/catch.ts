import { ZodCatchDef, ZodTypeAny } from "zod";
import { parseDef } from "../parseDef.js";
import { DefParser } from "../parseTypes.js";

export const parseCatchDef: DefParser<ZodCatchDef<ZodTypeAny>, true> = (
  def,
  refs,
) => {
  return parseDef(def.innerType._def, refs);
};
