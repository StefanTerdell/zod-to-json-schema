import { ZodNumberDef } from "zod";
import { References } from "../References";

export type JsonSchema7NumberType = {
  type: "number" | "integer";
  minimum?: number;
  exclusiveMinimum?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
};

export function parseNumberDef(
  def: ZodNumberDef,
  refs: References
): JsonSchema7NumberType {
  const res: JsonSchema7NumberType = {
    type: "number",
  };

  if (def.checks) {
    for (const check of def.checks) {
      switch (check.kind) {
        case "int":
          res.type = "integer";
          break;
        case "min":
          if (refs.target === "jsonSchema") {
            if (check.inclusive) {
              res.minimum = check.value;
            } else {
              res.exclusiveMinimum = check.value;
            }
          } else {
            if (!check.inclusive) {
              res.exclusiveMinimum = true as any;
            }
            res.minimum = check.value;
          }
          break;
        case "max":
          if (refs.target === "jsonSchema") {
            if (check.inclusive) {
              res.maximum = check.value;
            } else {
              res.exclusiveMaximum = check.value;
            }
          } else {
            if (!check.inclusive) {
              res.exclusiveMaximum = true as any;
            }
            res.maximum = check.value;
          }
          break;
        case "multipleOf":
          res.multipleOf = check.value;
          break;
      }
    }
  }

  return res;
}
