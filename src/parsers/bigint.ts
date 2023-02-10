export type JsonSchema7BigintType = {
  type: "integer";
  format: "int64";
};

export function parseBigintDef(): JsonSchema7BigintType {
  return {
    type: "integer",
    format: "int64",
  };
}
