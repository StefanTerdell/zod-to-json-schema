import { ZodTupleDef, ZodTupleItems, ZodTypeAny } from "zod";
import { JsonSchema7Type, parseDef, Visited } from "../parseDef";

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
  path: string[],
  visited: Visited
): JsonSchema7TupleType {
  if (def.rest) {
    return {
      type: "array",
      minItems: def.items.length,
      items: def.items
        .map((x, i) =>
          parseDef(x._def, [...path, "items", i.toString()], visited)
        )
        .reduce(
          (acc: JsonSchema7Type[], x) => (x === undefined ? acc : [...acc, x]),
          []
        ),
      additionalItems: parseDef(
        def.rest._def,
        [...path, "additionalItems"],
        visited
      ),
    };
  } else {
    return {
      type: "array",
      minItems: def.items.length,
      maxItems: def.items.length,
      items: def.items
        .map((x, i) =>
          parseDef(x._def, [...path, "items", i.toString()], visited)
        )
        .reduce(
          (acc: JsonSchema7Type[], x) => (x === undefined ? acc : [...acc, x]),
          []
        ),
    };
  }
}
