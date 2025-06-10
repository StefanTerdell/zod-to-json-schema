import { ZodDefaultDef } from "zod";
import { parseDef } from "../parseDef.js";
import { Refs } from "../Refs.js";
import { DefParser, ensureObjectSchema } from "../parseTypes.js";

export const parseDefaultDef: DefParser<ZodDefaultDef> = (
  def: ZodDefaultDef,
  refs: Refs,
) => {
  return {
    ...ensureObjectSchema(parseDef(def.innerType._def, refs)),
    default: def.defaultValue(),
  };
};
