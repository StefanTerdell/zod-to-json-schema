import { ZodFirstPartyTypeKind, ZodRecordDef, ZodTypeAny } from "zod";
import { JsonSchema7Type, parseDef, Visited } from "../parseDef";
import { JsonSchema7StringType, parseStringDef } from "./string";

type JsonSchema7RecordPropertyNamesType = Omit<JsonSchema7StringType, "type">;

export type JsonSchema7RecordType = {
  type: "object";
  additionalProperties: JsonSchema7Type;
  propertyNames?: JsonSchema7RecordPropertyNamesType;
};

export function parseRecordDef(
  def: ZodRecordDef<ZodTypeAny, ZodTypeAny>,
  path: string[],
  visited: Visited
): JsonSchema7RecordType {
  if (
    def.keyType._def.typeName === ZodFirstPartyTypeKind.ZodString &&
    def.keyType._def.checks?.length
  ) {
    const keyType: JsonSchema7RecordPropertyNamesType = Object.entries(
      parseStringDef(def.keyType._def)
    ).reduce(
      (acc, [key, value]) => (key === "type" ? acc : { ...acc, [key]: value }),
      {}
    );

    return {
      type: "object",
      additionalProperties:
        parseDef(
          def.valueType._def,
          [...path, "additionalProperties"],
          visited
        ) || {},
      propertyNames: keyType,
    };
  } else {
    return {
      type: "object",
      additionalProperties:
        parseDef(
          def.valueType._def,
          [...path, "additionalProperties"],
          visited
        ) || {},
    };
  }
}
