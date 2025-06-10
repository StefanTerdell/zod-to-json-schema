import { ZodNullDef } from "zod";
import { DefParser } from "../parseTypes.js";

export const parseNullDef: DefParser<ZodNullDef> = () => {
  return {
    type: "null",
  };
};
