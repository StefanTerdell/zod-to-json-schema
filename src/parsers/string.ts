import { ZodStringDef } from "zod";

export type JsonSchema7StringType = {
  type: "string";
  minLength?: number;
  maxLength?: number;
};

export function parseStringDef(def: ZodStringDef): JsonSchema7StringType {
  const res: JsonSchema7StringType = {
    type: "string",
  };

  if (def.checks) {
    for (const check of def.checks) {
      switch (check.kind) {
        case "regex":
          // These are all regexp based (except URL which is "new Uri()" based) and zod does not seem to expose the source regexp right now.
          break;
        case "min":
          res.minLength = check.value;
          break;
        case "max":
          res.maxLength = check.value;
          break;
      }
    }
  }

  return res;
}
