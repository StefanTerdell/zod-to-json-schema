import { ZodFirstPartyTypeKind, ZodMapDef, ZodRecordDef, ZodTypeAny } from "zod"
import { parseDef } from "../parseDef.js"
import { Refs } from "../Refs.js"
import { parseStringDef } from "./string.js"
import { JsonSchema, JsonSchemaObject } from "../JsonSchema.js"

export function parseRecordDef(
  def: ZodRecordDef<ZodTypeAny, ZodTypeAny> | ZodMapDef,
  refs: Refs,
): JsonSchema {
  if (
    refs.target === "openApi3" &&
    def.keyType?._def.typeName === ZodFirstPartyTypeKind.ZodEnum
  ) {
    return {
      type: "object",
      required: def.keyType._def.values,
      properties: def.keyType._def.values.reduce(
        (acc: Record<string, JsonSchemaObject>, key: string) => ({
          ...acc,
          [key]:
            parseDef(def.valueType._def, {
              ...refs,
              currentPath: [...refs.currentPath, "properties", key],
            }) ?? {},
        }),
        {},
      ),
      additionalProperties: false,
    } satisfies JsonSchemaObject as any
  }

  const schema: JsonSchemaObject = {
    type: "object",
    additionalProperties:
      parseDef(def.valueType._def, {
        ...refs,
        currentPath: [...refs.currentPath, "additionalProperties"],
      }) ?? {},
  }

  if (refs.target === "openApi3") {
    return schema
  }

  if (
    def.keyType?._def.typeName === ZodFirstPartyTypeKind.ZodString &&
    def.keyType._def.checks?.length
  ) {
    const keyType: JsonSchemaObject = Object.entries(
      parseStringDef(def.keyType._def, refs),
    ).reduce(
      (acc, [key, value]) => (key === "type" ? acc : { ...acc, [key]: value }),
      {},
    )

    return {
      ...schema,
      propertyNames: keyType,
    }
  } else if (def.keyType?._def.typeName === ZodFirstPartyTypeKind.ZodEnum) {
    return {
      ...schema,
      propertyNames: {
        enum: def.keyType._def.values,
      },
    }
  }

  return schema
}
