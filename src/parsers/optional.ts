import { ZodOptionalDef } from "zod";
import { References } from "../References";
import { JsonSchema7Type, parseDef } from '../parseDef';

export const parseOptionalDef = (
  def: ZodOptionalDef,
  refs: References
): JsonSchema7Type | undefined => {
  if (refs.currentPath.toString() === refs.propertyPath.toString()) {
    return parseDef(def.innerType._def, refs);
  }

  const innerSchema = parseDef(
    def.innerType._def,
    refs.addToPath("anyOf", "1")
  );

  return innerSchema
    ? {
      anyOf: [
        {
          not: {},
        },
        innerSchema,
      ],
    }
    : {};
};
