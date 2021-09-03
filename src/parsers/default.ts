import { ZodDefaultDef } from "zod";
import { JsonSchema7Type, parseDef, Visited } from "../parseDef";

export function parseDefaultDef(
  _def: ZodDefaultDef,
  path: string[],
  visited: Visited
): JsonSchema7Type & { default: any } {
  return {
    ...parseDef(_def.innerType._def, path, visited),
    default: _def.defaultValue(),
  };
}
