import { ZodPromiseDef } from "zod";
import { parseDef, Visited } from "../parseDef";

export function parsePromiseDef(
  def: ZodPromiseDef,
  path: string[],
  visited: Visited
) {
  return parseDef(def.type, path, visited);
}
