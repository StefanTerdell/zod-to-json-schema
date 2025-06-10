import { ZodIntersectionDef } from "zod";
import { parseDef } from "../parseDef.js";
import { DefParser, ZodJsonSchema, ensureObjectSchema } from "../parseTypes.js";

export const parseIntersectionDef: DefParser<ZodIntersectionDef, true> = (
  def,
  refs,
) => {
  const left = ensureObjectSchema(
    parseDef(def.left._def, {
      ...refs,
      // rejectedAdditionalProperties: undefined,
      currentPath: [...refs.currentPath, "allOf", "0"],
    }),
  );

  const right = ensureObjectSchema(
    parseDef(def.right._def, {
      ...refs,
      // rejectedAdditionalProperties: undefined,
      currentPath: [...refs.currentPath, "allOf", "1"],
    }),
  );

  if (!left) {
    return right;
  }

  if (!right) {
    return left;
  }

  const allOf: ZodJsonSchema<true>[] = [];

  let unevaluatedProperties: boolean | undefined = undefined;

  if (left.allOf && Object.keys(left).length === 1) {
    allOf.push(...left.allOf);
  } else if (
    left.allOf &&
    Object.keys(left).length === 2 &&
    left.unevaluatedProperties !== undefined
  ) {
    if (left.unevaluatedProperties === false) {
      unevaluatedProperties = false;
    }
    allOf.push(...left.allOf);
  } else {
    allOf.push(left);
  }

  if (right.allOf && Object.keys(right).length === 1) {
    allOf.push(...right.allOf);
  } else if (
    right.allOf &&
    Object.keys(right).length === 2 &&
    right.unevaluatedProperties !== undefined
  ) {
    if (right.unevaluatedProperties === false) {
      unevaluatedProperties = false;
    }
    allOf.push(...right.allOf);
  } else {
    allOf.push(right);
  }

  for (const x of allOf) {
    if (x.additionalProperties === false) {
      delete x.additionalProperties;
      if (!unevaluatedProperties) {
        unevaluatedProperties = false;
      }
    } else if (x.unevaluatedProperties === false) {
      delete x.unevaluatedProperties;
      if (!unevaluatedProperties) {
        unevaluatedProperties = false;
      }
    } else {
      unevaluatedProperties = true;
    }
  }

  if (unevaluatedProperties === false) {
    return {
      allOf,
      unevaluatedProperties,
    };
  }

  return {
    allOf,
  };
};
