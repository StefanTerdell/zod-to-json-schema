import { ZodEnumDef } from "zod";

export type JsonSchema7EnumType = {
  type: "string";
  enum: string[];
};

export function parseEnumDef(def: ZodEnumDef): JsonSchema7EnumType {
  return {
    type: "string",
    enum: Array.from(def.values),
  };
}
