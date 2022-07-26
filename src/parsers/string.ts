import { ZodStringDef } from "zod";

export type JsonSchema7StringType = {
  type: "string";
  minLength?: number;
  maxLength?: number;
  format?: "email" | "uri" | "uuid";
  pattern?: string;
  allOf?: { pattern: string }[];
};

export function parseStringDef(def: ZodStringDef): JsonSchema7StringType {
  const res: JsonSchema7StringType = {
    type: "string",
  };

  if (def.checks) {
    for (const check of def.checks) {
      switch (check.kind) {
        case "min":
          res.minLength =
            typeof res.minLength === "number"
              ? Math.max(res.minLength, check.value)
              : check.value;
          break;
        case "max":
          res.maxLength =
            typeof res.maxLength === "number"
              ? Math.min(res.maxLength, check.value)
              : check.value;
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
          addPattern(res, check.regex.source);
          break;
        case "cuid":
          addPattern(res, "^c[^\\s-]{8,}$");
          break;
        case "startsWith":
          addPattern(res, "^" + escapeNonAlphaNumeric(check.value));
          break;
        case "endsWith":
          addPattern(res, escapeNonAlphaNumeric(check.value) + "$");
          break;
        case "trim":
          // I have no idea why this is a check in Zod. It's a runtime string manipulation method.
          break;
        default:
          ((_: never) => {})(check);
      }
    }
  }

  return res;
}

const escapeNonAlphaNumeric = (value: string) =>
  Array.from(value)
    .map((c) => (/[a-zA-Z0-9]/.test(c) ? c : `\\${c}`))
    .join("");

const addPattern = (schema: JsonSchema7StringType, value: string) => {
  if (schema.pattern || schema.allOf?.some((x) => x.pattern)) {
    if (!schema.allOf) {
      schema.allOf = [];
    }

    if (schema.pattern) {
      schema.allOf!.push({ pattern: schema.pattern });
      delete schema.pattern;
    }

    schema.allOf!.push({ pattern: value });
  } else {
    schema.pattern = value;
  }
};
