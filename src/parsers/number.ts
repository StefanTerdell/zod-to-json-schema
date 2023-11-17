import { ZodNumberDef } from "zod"
import { addErrorMessage, setResponseValueAndErrors } from "../errorMessages.js"
import { Refs } from "../Refs.js"
import { JsonSchema, JsonSchemaObject } from "../JsonSchema.js"

export function parseNumberDef(def: ZodNumberDef, refs: Refs): JsonSchema {
  const res: JsonSchemaObject = {
    type: "number",
  }

  if (!def.checks) return res

  for (const check of def.checks) {
    switch (check.kind) {
      case "int":
        res.type = "integer"
        addErrorMessage(res, "type", check.message, refs)
        break
      case "min":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(
              res,
              "minimum",
              check.value,
              check.message,
              refs,
            )
          } else {
            setResponseValueAndErrors(
              res,
              "exclusiveMinimum",
              check.value,
              check.message,
              refs,
            )
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMinimum = true as any
          }
          setResponseValueAndErrors(
            res,
            "minimum",
            check.value,
            check.message,
            refs,
          )
        }
        break
      case "max":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(
              res,
              "maximum",
              check.value,
              check.message,
              refs,
            )
          } else {
            setResponseValueAndErrors(
              res,
              "exclusiveMaximum",
              check.value,
              check.message,
              refs,
            )
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMaximum = true as any
          }
          setResponseValueAndErrors(
            res,
            "maximum",
            check.value,
            check.message,
            refs,
          )
        }
        break
      case "multipleOf":
        setResponseValueAndErrors(
          res,
          "multipleOf",
          check.value,
          check.message,
          refs,
        )
        break
    }
  }
  return res
}
