import { ZodPromiseDef } from "zod";
import { parseDef } from "../parseDef.js";
import { DefParser } from "../parseTypes.js";

export const parsePromiseDef: DefParser<ZodPromiseDef, true> = (def, refs) => {
  return parseDef(def.type._def, refs);
};
