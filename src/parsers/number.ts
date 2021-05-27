import { ZodNumberDef } from "zod"

export type JsonSchema7NumberType = {
  type: 'number' | 'integer'
  minimum?: number
  exclusiveMinimum?: number
  maximum?: number
  exclusiveMaximum?: number
}

export function parseNumberDef(def: ZodNumberDef): JsonSchema7NumberType {
  const res: JsonSchema7NumberType = {
    type: 'number',
  }

  if (def.checks) {
    for (const check of def.checks) {
      switch (check.kind) {
        case "min":
          if (!check.inclusive) {
            res.exclusiveMinimum = check.value
          }
          res.minimum = check.value
          break
        case "max":
          if (!check.inclusive) {
            res.exclusiveMaximum = check.value
          }
          res.maximum = check.value
          break
        case "int":
          res.type = 'integer'
          break
      }
    }
  }

  return res
}
