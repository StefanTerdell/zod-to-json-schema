import { ZodBigIntDef } from "zod";

export type JsonSchema7BigintType = {
  type: "integer";
  format: "int64";
};

export function parseBigintDef(def: ZodBigIntDef): JsonSchema7BigintType {
  return {
    type: "integer",
    format: "int64",
  };
}
