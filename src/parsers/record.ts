import { ZodRecordDef, ZodTypeDef } from "zod";

import { JsonSchema7Type, parseDef, Visited } from "../parseDef";

export type JsonSchema7RecordType = {
  type: "object";
  additionalProperties: JsonSchema7Type;
};

export function parseRecordDef(
  def: ZodRecordDef,
  path: string[],
  visited: Visited
): JsonSchema7RecordType {
  return {
    type: "object",
    additionalProperties:
      parseDef(def.valueType, [...path, "additionalProperties"], visited) || {},
  };
}
