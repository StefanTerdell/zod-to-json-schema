import { ZodMapDef } from "zod";
import { JsonSchema7Type, parseDef, Visited } from "../parseDef";

export type JsonSchema7MapType = {
  type: "array";
  maxItems: 125;
  items: {
    type: "array";
    items: [JsonSchema7Type, JsonSchema7Type];
    minItems: 2,
    maxItems: 2,
    additionalItems: false
  };
};

export function parseMapDef(
  def: ZodMapDef,
  path: string[],
  visited: Visited
): JsonSchema7MapType {
  const keys = parseDef(def.keyType._def, path, visited) || {};
  const values = parseDef(def.valueType._def, path, visited) || {};
  return {
    type: "array",
    maxItems: 125,
    items: {
      type: "array",
      items: [keys, values],
      minItems: 2,
      maxItems: 2,
      additionalItems: false
    },
  };
}
