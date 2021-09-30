import { ZodTupleDef, ZodTupleItems, ZodTypeAny } from "zod";
import { JsonSchema7Type, parseDef } from "../parseDef";
import { References } from "../References";

export type JsonSchema7TupleType = {
  type: "array";
  minItems: number;
  items: JsonSchema7Type[];
} & (
  | {
      maxItems: number;
    }
  | {
      additionalItems?: JsonSchema7Type;
    }
);

export function parseTupleDef(
  def: ZodTupleDef<ZodTupleItems | [], ZodTypeAny | null>,
  refs: References
): JsonSchema7TupleType {
  if (def.rest) {
    return {
      type: "array",
      minItems: def.items.length,
      items: def.items
        .map((x, i) => parseDef(x._def, refs.addToPath("items", i.toString())))
        .reduce(
          (acc: JsonSchema7Type[], x) => (x === undefined ? acc : [...acc, x]),
          []
        ),
      additionalItems: parseDef(
        def.rest._def,
        refs.addToPath("additionalItems")
      ),
    };
  } else {
    return {
      type: "array",
      minItems: def.items.length,
      maxItems: def.items.length,
      items: def.items
        .map((x, i) => parseDef(x._def, refs.addToPath("items", i.toString())))
        .reduce(
          (acc: JsonSchema7Type[], x) => (x === undefined ? acc : [...acc, x]),
          []
        ),
    };
  }
}
