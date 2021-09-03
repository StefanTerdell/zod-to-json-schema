import { ZodDefaultDef } from "zod";
import { parseDef, Visited } from "../parseDef";

export function parseDefaultDef(
  _def: ZodDefaultDef,
  path: string[],
  visited: Visited
) {
  return {
    ...parseDef(_def.innerType._def, path, visited),
    default: _def.defaultValue(),
  };
}
