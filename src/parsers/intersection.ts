import { ZodIntersectionDef } from "zod";
import { JsonSchema7Type, parseDef } from "../parseDef";
import { References } from "../References";

export type JsonSchema7AllOfType = {
  allOf: JsonSchema7Type[];
};

export function parseIntersectionDef(
  def: ZodIntersectionDef,
  refs: References
): JsonSchema7AllOfType | JsonSchema7Type | undefined {
  const allOf = [
    parseDef(def.left._def, refs.addToPath("allOf", "0")),
    parseDef(def.right._def, refs.addToPath("allOf", "1")),
  ].filter((x): x is JsonSchema7Type => !!x);

  return allOf.length ? { allOf } : undefined;
}
