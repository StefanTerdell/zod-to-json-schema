import { ZodDefaultDef } from "zod";
import { JsonSchema7Type, parseDef } from "../parseDef";
import { References } from "../References";

export function parseDefaultDef(
  _def: ZodDefaultDef,
  refs: References
): JsonSchema7Type & { default: any } {
  return {
    ...parseDef(_def.innerType._def, refs),
    default: _def.defaultValue(),
  };
}
