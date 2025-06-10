import { ZodMapDef, ZodRecordDef, ZodTypeAny } from "zod";
import { parseDef } from "../parseDef.js";
import { DefParser, ensureObjectSchema } from "../parseTypes.js";

export const parseRecordDef: DefParser<
  ZodRecordDef<ZodTypeAny, ZodTypeAny> | ZodMapDef
> = (def, refs) => {
  const schema: ReturnType<typeof parseRecordDef> = {
    type: "object",
    additionalProperties:
      parseDef(def.valueType._def, {
        ...refs,
        currentPath: [...refs.currentPath, "additionalProperties"],
      }) ?? refs.allowedAdditionalProperties,
  };

  if (typeof def.keyType?._def.typeName === "string") {
    const keySchema = ensureObjectSchema(parseDef(def.keyType?._def, refs));

    if (keySchema?.type === "string" && Object.keys(keySchema).length > 1) {
      return {
        ...schema,
        propertyNames: omit(keySchema, "type"),
      };
    }
  }

  return schema;
};

const omit = <T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> => {
  return Object.keys(obj).reduce((acc: any, key: any) => {
    if (!keys.includes(key)) {
      acc[key] = obj[key as keyof T];
    }

    return acc;
  }, {}) as any;
};
