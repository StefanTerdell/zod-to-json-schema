import { ZodRecordDef } from "zod";
import { JsonSchema7Type, parseDef, Visited } from "../parseDef";
import { JsonSchema7StringType, parseStringDef } from "./string";

export type JsonSchema7RecordType = {
  type: "object";
  additionalProperties: JsonSchema7Type;
  propertyNames?: JsonSchema7StringType;
};

export function parseRecordDef(
  def: ZodRecordDef,
  path: string[],
  visited: Visited
): JsonSchema7RecordType {
  return {
    type: "object",
    additionalProperties:
      parseDef(
        def.valueType._def,
        [...path, "additionalProperties"],
        visited
      ) || {},
    propertyNames: def.keyType._def.checks?.length
      ? parseStringDef(def.keyType._def)
      : undefined,
  };
}
