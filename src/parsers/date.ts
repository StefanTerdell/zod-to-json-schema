import { ZodDateDef } from "zod";
import { setResponseValueAndErrors } from "../errorMessages.js";
import {
  DefParser,
  isNonNullSchema,
  ensureObjectSchema,
} from "../parseTypes.js";

export const parseDateDef: DefParser<ZodDateDef> = (def, refs) => {
  if (Array.isArray(refs.dateStrategy)) {
    return {
      anyOf: refs.dateStrategy
        .map((dateStrategy) => parseDateDef(def, { ...refs, dateStrategy }))
        .filter(isNonNullSchema)
        .map(ensureObjectSchema),
    };
  }

  switch (refs.dateStrategy) {
    case "string":
    case "format:date-time":
      return {
        type: "string",
        format: "date-time",
      };
    case "format:date":
      return {
        type: "string",
        format: "date",
      };
    case "integer":
      return integerDateParser(def, refs);
  }
};

const integerDateParser: DefParser<ZodDateDef> = (def, refs) => {
  const res: ReturnType<typeof integerDateParser> = {
    type: "integer",
    format: "unix-time",
  };

  if (refs.target === "openApi3") {
    return res;
  }

  for (const check of def.checks) {
    switch (check.kind) {
      case "min":
        setResponseValueAndErrors(
          res,
          "minimum",
          check.value, // This is in milliseconds
          check.message,
          refs,
        );
        break;
      case "max":
        setResponseValueAndErrors(
          res,
          "maximum",
          check.value, // This is in milliseconds
          check.message,
          refs,
        );
        break;
    }
  }

  return res;
};
