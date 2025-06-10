import { ZodEffectsDef } from "zod";
import { parseDef } from "../parseDef.js";
import { Refs } from "../Refs.js";
import { DefParser } from "../parseTypes.js";

export const parseEffectsDef: DefParser<ZodEffectsDef, true> = (
  _def: ZodEffectsDef,
  refs: Refs,
) => {
  return refs.effectStrategy === "input"
    ? parseDef(_def.schema._def, refs)
    : true;
};
