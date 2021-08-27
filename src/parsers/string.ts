import { ZodStringDef } from "zod";

export type JsonSchema7StringType = {
  type: "string";
  minLength?: number;
  maxLength?: number;
  format?: "email" | "uri" | "uuid";
  pattern?: string;
};

export function parseStringDef(def: ZodStringDef): JsonSchema7StringType {
  const res: JsonSchema7StringType = {
    type: "string",
  };

  if (def.checks) {
    for (const check of def.checks) {
      switch (check.kind) {
        case "min":
          res.minLength = check.value;
          break;
        case "max":
          res.maxLength = check.value;
          break;
        case "email":
          res.format = "email";
          break;
        case "url":
          res.format = "uri";
          break;
        case "uuid":
          res.format = "uuid";
          break;
        case "regex":
          res.pattern = check.regex.source;
          break;
        case "cuid":
          res.pattern = "^c[^\\s-]{8,}$";
          break;
        default:
          ((youForgotOne: never) => {})(check);
      }
    }
  }

  return res;
}
