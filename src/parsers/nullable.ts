import { ZodNullableDef } from "zod"
import { parseDef } from "../parseDef.js"
import { Refs } from "../Refs.js"
import { primitiveMappings } from "./union.js"
import { JsonSchema } from "../JsonSchema.js"

export function parseNullableDef(
  def: ZodNullableDef,
  refs: Refs,
): JsonSchema | undefined {
  if (
    ["ZodString", "ZodNumber", "ZodBigInt", "ZodBoolean", "ZodNull"].includes(
      def.innerType._def.typeName,
    ) &&
    (!def.innerType._def.checks || !def.innerType._def.checks.length)
  ) {
    if (refs.target === "openApi3") {
      return {
        type: primitiveMappings[
          def.innerType._def.typeName as keyof typeof primitiveMappings
        ],
        nullable: true,
      } as any
    }

    return {
      type: [
        primitiveMappings[
          def.innerType._def.typeName as keyof typeof primitiveMappings
        ],
        "null",
      ],
    }
  }

  if (refs.target === "openApi3") {
    const base = parseDef(def.innerType._def, {
      ...refs,
      currentPath: [...refs.currentPath],
    })

    return typeof base === "object" && { ...base, nullable: true }
  }

  const base = parseDef(def.innerType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "anyOf", "0"],
  })

  return base && { anyOf: [base, { type: "null" }] }
}
