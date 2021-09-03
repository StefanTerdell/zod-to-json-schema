import { ZodEffectsDef } from "zod";
import { parseDef, Visited } from "../parseDef";

export function parseEffectsDef(
  _def: ZodEffectsDef,
  path: string[],
  visited: Visited
) {
  return parseDef(_def.schema._def, path, visited);
}
