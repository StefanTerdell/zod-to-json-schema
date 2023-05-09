import { ZodIntersectionDef } from "zod";
import { JsonSchema7Type, parseDef } from "../parseDef";
import { Refs } from "../Refs";

export type JsonSchema7AllOfType = {
  allOf: JsonSchema7Type[];
  unevaluatedProperties: boolean;
};

export function parseIntersectionDef(
  def: ZodIntersectionDef,
  refs: Refs
): JsonSchema7AllOfType | JsonSchema7Type | undefined {
  const allOf = [
    parseDef(def.left._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", "0"],
    }),
    parseDef(def.right._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", "1"],
    }),
  ].filter((x): x is JsonSchema7Type => !!x)
    .map((schema) => {
      if ('additionalProperties' in schema && schema.additionalProperties === false) {
        const {additionalProperties, ...rest} = schema;
        return {
          ...rest
        };
      }
      return schema
    });

  return allOf.length ? {allOf, unevaluatedProperties: false} : undefined;
}
