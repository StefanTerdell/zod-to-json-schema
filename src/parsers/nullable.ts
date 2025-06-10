import { ZodNullableDef } from "zod";
import { parseDef } from "../parseDef.js";
import { scalarMap } from "./union.js";
import { DefParser, ensureObjectSchema } from "../parseTypes.js";

export const parseNullableDef: DefParser<ZodNullableDef, true> = (
  def,
  refs,
) => {
  if (
    ["ZodString", "ZodNumber", "ZodBigInt", "ZodBoolean", "ZodNull"].includes(
      def.innerType._def.typeName,
    ) &&
    (!def.innerType._def.checks || !def.innerType._def.checks.length)
  ) {
    return {
      type: [
        scalarMap[def.innerType._def.typeName as keyof typeof scalarMap],
        "null",
      ],
    };
  }

  const base = parseDef(def.innerType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "anyOf", "0"],
  });

  if (!base) {
    return base;
  }

  return { anyOf: [ensureObjectSchema(base), { type: "null" }] };
};
