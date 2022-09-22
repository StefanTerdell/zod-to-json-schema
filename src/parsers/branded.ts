import { ZodBrandedDef } from "zod";
import { parseDef } from "../parseDef";
import { References } from "../References";

export function parseBrandedDef(
  _def: ZodBrandedDef<any>,
  refs: References
) {
  return parseDef(_def.type._def, refs)
}
