import { ZodIntersectionDef } from "zod";
import { JsonSchema7Type, parseDef, Visited } from "../parseDef";

export function parseIntersectionDef(
  def: ZodIntersectionDef,
  path: string[],
  visited: Visited
): JsonSchema7Type {
  const allOf = [
    parseDef(def.left, [...path, 'allOf', '0'], visited)!,
    parseDef(def.right, [...path, 'allOf', '1'], visited)!,
  ].filter(Boolean);
  return allOf.length === 2 ? { allOf } : allOf.length === 1 ? allOf[0] : {};
}
