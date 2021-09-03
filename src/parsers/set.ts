import { ZodSetDef } from "zod";
import { JsonSchema7Type, parseDef, Visited } from "../parseDef";

export type JsonSchema7SetType = {
  type: "array";
  items: JsonSchema7Type;
};

export function parseSetDef(
  def: ZodSetDef,
  path: string[],
  visited: Visited
): JsonSchema7SetType | undefined {
  const items = parseDef(def.valueType._def, [...path, "items"], visited);
  return items ? { type: "array", items } : undefined;
}
