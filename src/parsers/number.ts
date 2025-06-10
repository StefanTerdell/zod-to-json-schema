import { ZodNumberDef } from "zod";
import {
  addErrorMessage,
  setResponseValueAndErrors,
} from "../errorMessages.js";
import { DefParser } from "../parseTypes.js";

export const parseNumberDef: DefParser<ZodNumberDef> = (def, refs) => {
  const res: ReturnType<typeof parseNumberDef> = {
    type: "number",
  };

  if (!def.checks) return res;

  for (const check of def.checks) {
    switch (check.kind) {
      case "int":
        res.type = "integer";
        addErrorMessage(res, "type", check.message, refs);
        break;
      case "min":
        if (check.inclusive) {
          setResponseValueAndErrors(
            res,
            "minimum",
            check.value,
            check.message,
            refs,
          );
        } else {
          setResponseValueAndErrors(
            res,
            "exclusiveMinimum",
            check.value,
            check.message,
            refs,
          );
        }

        break;
      case "max":
        if (check.inclusive) {
          setResponseValueAndErrors(
            res,
            "maximum",
            check.value,
            check.message,
            refs,
          );
        } else {
          setResponseValueAndErrors(
            res,
            "exclusiveMaximum",
            check.value,
            check.message,
            refs,
          );
        }

        break;
      case "multipleOf":
        setResponseValueAndErrors(
          res,
          "multipleOf",
          check.value,
          check.message,
          refs,
        );
        break;
    }
  }
  return res;
};
