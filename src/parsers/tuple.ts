import { ZodTupleDef, ZodTupleItems, ZodTypeAny } from "zod";
import {  parseDef } from "../parseDef.js";
import { Refs } from "../Refs.js";
import { JsonSchema } from "../JsonSchema.js";

export function parseTupleDef(
  def: ZodTupleDef<ZodTupleItems | [], ZodTypeAny | null>,
  refs: Refs
): JsonSchema {
  if (def.rest) {
    return {
      type: "array",
      minItems: def.items.length,
      items: def.items
        .map((x, i) =>
          parseDef(x._def, {
            ...refs,
            currentPath: [...refs.currentPath, "items", `${i}`],
          })
        )
        .reduce(
          (acc: JsonSchema[], x) => (x === undefined ? acc : [...acc, x]),
          []
        ),
      additionalItems: parseDef(def.rest._def, {
        ...refs,
        currentPath: [...refs.currentPath, "additionalItems"],
      }),
    };
  } else {
    return {
      type: "array",
      minItems: def.items.length,
      maxItems: def.items.length,
      items: def.items
        .map((x, i) =>
          parseDef(x._def, {
            ...refs,
            currentPath: [...refs.currentPath, "items", `${i}`],
          })
        )
        .reduce(
          (acc: JsonSchema[], x) => (x === undefined ? acc : [...acc, x]),
          []
        ),
    };
  }
}
