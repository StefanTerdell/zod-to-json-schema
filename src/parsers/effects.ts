import { ZodEffectsDef } from "zod";
import { JsonSchema7Type, parseDef } from "../parseDef";
import { References } from "../References";

export function parseEffectsDef(
  _def: ZodEffectsDef,
  refs: References
): JsonSchema7Type | undefined {
  return parseDef(_def.schema._def, refs);
}
