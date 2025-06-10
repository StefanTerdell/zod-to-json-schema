import { ZodTupleDef, ZodTupleItems, ZodTypeAny } from "zod";
import { parseDef } from "../parseDef.js";
import {
  DefParser,
  ensureObjectSchema,
  isNonNullSchema,
} from "../parseTypes.js";

export const parseTupleDef: DefParser<
  ZodTupleDef<ZodTupleItems | [], ZodTypeAny | null>
> = (def, refs) => {
  if (def.rest) {
    return {
      type: "array",
      minItems: def.items.length,
      prefixItems: def.items
        .map((x, i) =>
          ensureObjectSchema(
            parseDef(x._def, {
              ...refs,
              currentPath: [...refs.currentPath, "items", `${i}`],
            }),
          ),
        )
        .filter(isNonNullSchema),
      additionalItems:
        parseDef(def.rest._def, {
          ...refs,
          currentPath: [...refs.currentPath, "additionalItems"],
        }) ?? undefined,
    };
  } else {
    return {
      type: "array",
      minItems: def.items.length,
      maxItems: def.items.length,
      prefixItems: def.items
        .map((x, i) =>
          ensureObjectSchema(
            parseDef(x._def, {
              ...refs,
              currentPath: [...refs.currentPath, "items", `${i}`],
            }),
          ),
        )
        .filter(isNonNullSchema),
    };
  }
};
