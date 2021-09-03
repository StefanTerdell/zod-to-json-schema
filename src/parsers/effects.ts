import { ZodEffectsDef } from "zod";
import { JsonSchema7Type, parseDef, Visited } from "../parseDef";

export function parseEffectsDef(
  _def: ZodEffectsDef,
  path: string[],
  visited: Visited
): JsonSchema7Type | undefined {
  return parseDef(_def.schema._def, path, visited);
}
