import { ZodPromiseDef } from "zod";
import { JsonSchema7Type, parseDef, Visited } from "../parseDef";

export function parsePromiseDef(
  def: ZodPromiseDef,
  path: string[],
  visited: Visited
): JsonSchema7Type | undefined {
  return parseDef(def.type._def, path, visited);
}
