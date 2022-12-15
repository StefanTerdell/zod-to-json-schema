import { ZodStringDef } from "zod";
import { ErrorMessages, setResponseValueAndErrors } from "../errorMessages";
import { Refs } from "../refs";

export type JsonSchema7StringType = {
  type: "string";
  minLength?: number;
  maxLength?: number;
  format?: "email" | "uri" | "uuid";
  pattern?: string;
  allOf?: {
    pattern: string;
    errorMessage?: ErrorMessages<{ pattern: string }>;
  }[];
  errorMessage?: ErrorMessages<JsonSchema7StringType>;
};

export function parseStringDef(
  def: ZodStringDef,
  refs: Refs
): JsonSchema7StringType {
  const res: JsonSchema7StringType = {
    type: "string",
  };

  if (def.checks) {
    for (const check of def.checks) {
      switch (check.kind) {
        case "min":
          setResponseValueAndErrors(
            res,
            "minLength",
            typeof res.minLength === "number"
              ? Math.max(res.minLength, check.value)
              : check.value,
            check.message,
            refs
          );
          break;
        case "max":
          setResponseValueAndErrors(
            res,
            "maxLength",
            typeof res.maxLength === "number"
              ? Math.min(res.maxLength, check.value)
              : check.value,
            check.message,
            refs
          );

          break;
        case "email":
          setResponseValueAndErrors(
            res,
            "format",
            "email",
            check.message,
            refs
          );
          break;
        case "url":
          setResponseValueAndErrors(res, "format", "uri", check.message, refs);
          break;
        case "uuid":
          setResponseValueAndErrors(res, "format", "uuid", check.message, refs);
          break;
        case "regex":
          addPattern(res, check.regex.source, check.message, refs);
          break;
        case "cuid":
          addPattern(res, "^c[^\\s-]{8,}$", check.message, refs);
          break;
        case "startsWith":
          addPattern(
            res,
            "^" + escapeNonAlphaNumeric(check.value),
            check.message,
            refs
          );
          break;
        case "endsWith":
          addPattern(
            res,
            escapeNonAlphaNumeric(check.value) + "$",
            check.message,
            refs
          );
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

const addPattern = (
  schema: JsonSchema7StringType,
  value: string,
  message: string | undefined,
  refs: Refs
) => {
  if (schema.pattern || schema.allOf?.some((x) => x.pattern)) {
    if (!schema.allOf) {
      schema.allOf = [];
    }

    if (schema.pattern) {
      schema.allOf!.push({
        pattern: schema.pattern,
        ...(schema.errorMessage &&
          refs.errorMessages && {
            errorMessage: { pattern: schema.errorMessage.pattern },
          }),
      });
      delete schema.pattern;
      if (schema.errorMessage) {
        delete schema.errorMessage.pattern;
        if (Object.keys(schema.errorMessage).length === 0) {
          delete schema.errorMessage;
        }
      }
    }

    schema.allOf!.push({
      pattern: value,
      ...(message &&
        refs.errorMessages && { errorMessage: { pattern: message } }),
    });
  } else {
    setResponseValueAndErrors(schema, "pattern", value, message, refs);
  }
};
