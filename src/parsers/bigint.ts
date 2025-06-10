import { ZodBigIntDef } from "zod";
import { setResponseValueAndErrors } from "../errorMessages.js";
import { DefParser } from "../parseTypes.js";

export const parseBigintDef: DefParser<ZodBigIntDef> = (def, refs) => {
  const res: ReturnType<typeof parseBigintDef> = {
    type: "integer",
    format: "int64",
  };

  if (!def.checks) return res;

  for (const check of def.checks) {
    switch (check.kind) {
      case "min":
        if (check.inclusive) {
          setResponseValueAndErrors(
            res,
            "minimum",
            Number(check.value),
            check.message,
            refs,
          );
        } else {
          setResponseValueAndErrors(
            res,
            "exclusiveMinimum",
            Number(check.value),
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
            Number(check.value),
            check.message,
            refs,
          );
        } else {
          setResponseValueAndErrors(
            res,
            "exclusiveMaximum",
            Number(check.value),
            check.message,
            refs,
          );
        }

        break;
      case "multipleOf":
        setResponseValueAndErrors(
          res,
          "multipleOf",
          Number(check.value),
          check.message,
          refs,
        );
        break;
    }
  }
  return res;
};
