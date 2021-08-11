export type JsonSchema7DateType = {
  type: "string";
  format: "date-time";
};

export function parseDateDef(): JsonSchema7DateType {
  return {
    type: "string",
    format: "date-time",
  };
}
