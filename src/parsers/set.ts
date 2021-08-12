import { ZodSetDef } from "zod";
import { parseDef, Visited } from "../parseDef";
import { JsonSchema7ArrayType } from "./array";

export function parseSetDef(
  def: ZodSetDef,
  path: string[],
  visited: Visited
): JsonSchema7ArrayType {
  return {
    type: "array",
    items: parseDef(def.valueType, [...path, "items"], visited),
  };
}
