import { JSONSchema7Type } from "json-schema";
import { ZodIntersectionDef } from "zod";
import { JsonSchema7Type, parseDef, Visited } from "../parseDef";

export type JsonSchema7AllOfType = {
  allOf: JSONSchema7Type[];
};

export function parseIntersectionDef(
  def: ZodIntersectionDef,
  path: string[],
  visited: Visited
): JsonSchema7AllOfType | JsonSchema7Type | undefined {
  const allOf = [
    parseDef(def.left._def, [...path, "allOf", "0"], visited),
    parseDef(def.right._def, [...path, "allOf", "1"], visited),
  ].filter((x): x is JsonSchema7Type => !!x);

  switch (allOf.length) {
    case 2:
      // @ts-expect-error
      return { allOf };
    case 1:
      return allOf[0];
    default:
      return {};
  }
}
