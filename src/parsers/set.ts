import { ZodSetDef } from "zod";
import { JsonSchema7Type, parseDef } from "../parseDef";
import { Refs } from "../refs";

export type JsonSchema7SetType = {
  type: "array";
  items?: JsonSchema7Type;
  minItems?: number;
  maxItems?: number;
};

export function parseSetDef(def: ZodSetDef, refs: Refs): JsonSchema7SetType {
  const items = parseDef(def.valueType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items"],
  });

  const schema: JsonSchema7SetType = {
    type: "array",
    items,
  };

  if (def.minSize) {
    schema.minItems = def.minSize.value;
  }

  if (def.maxSize) {
    schema.maxItems = def.maxSize.value;
  }

  return schema;
}
