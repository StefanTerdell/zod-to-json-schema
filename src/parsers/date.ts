import { ZodDateDef } from "zod"
import { Refs } from "../Refs.js"
import { setResponseValueAndErrors } from "../errorMessages.js"
import { JsonSchema } from "../JsonSchema.js"

export function parseDateDef(def: ZodDateDef, refs: Refs): JsonSchema {
  if (refs.dateStrategy == "integer") {
    return integerDateParser(def, refs)
  } else {
    return {
      type: "string",
      format: "date-time",
    }
  }
}

const integerDateParser = (def: ZodDateDef, refs: Refs) => {
  const res: JsonSchema = {
    type: "integer",
    format: "unix-time",
  }

  for (const check of def.checks) {
    switch (check.kind) {
      case "min":
        if (refs.target === "jsonSchema7") {
          setResponseValueAndErrors(
            res,
            "minimum",
            check.value, // This is in milliseconds
            check.message,
            refs,
          )
        }
        break
      case "max":
        if (refs.target === "jsonSchema7") {
          setResponseValueAndErrors(
            res,
            "maximum",
            check.value, // This is in milliseconds
            check.message,
            refs,
          )
        }
        break
    }
  }

  return res
}
