import { ZodAnyDef } from "zod";
import { DefParser } from "../parseTypes";

export const parseAnyDef: DefParser<ZodAnyDef> = () => {
  return {};
};
