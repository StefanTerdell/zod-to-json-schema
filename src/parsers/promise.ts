import { ZodPromiseDef } from "zod";
import { JsonSchema7Type, parseDef } from "../parseDef";
import { References } from "../References";

export function parsePromiseDef(
  def: ZodPromiseDef,
  refs: References
): JsonSchema7Type | undefined {
  return parseDef(def.type._def, refs);
}
