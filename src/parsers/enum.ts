import { ZodEnumDef } from "zod";
import { DefParser } from "../parseTypes";

export const parseEnumDef: DefParser<ZodEnumDef> = (def) => {
  return {
    type: "string",
    enum: Array.from(def.values),
  };
};
