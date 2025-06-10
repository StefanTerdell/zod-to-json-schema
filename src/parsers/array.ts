import { ZodArrayDef, ZodFirstPartyTypeKind } from "zod";
import { setResponseValueAndErrors } from "../errorMessages.js";
import { parseDef } from "../parseDef.js";
import { DefParser, ensureObjectSchema } from "../parseTypes.js";

export const parseArrayDef: DefParser<ZodArrayDef> = (def, refs) => {
  const res: ReturnType<typeof parseArrayDef> = {
    type: "array",
  };

  if (
    def.type?._def &&
    def.type?._def?.typeName !== ZodFirstPartyTypeKind.ZodAny
  ) {
    const items = parseDef(def.type._def, {
      ...refs,
      currentPath: [...refs.currentPath, "items"],
    });

    if (items !== null) {
      res.items = ensureObjectSchema(items)
    }
  }

  if (def.minLength) {
    setResponseValueAndErrors(
      res,
      "minItems",
      def.minLength.value,
      def.minLength.message,
      refs,
    );
  }
  if (def.maxLength) {
    setResponseValueAndErrors(
      res,
      "maxItems",
      def.maxLength.value,
      def.maxLength.message,
      refs,
    );
  }
  if (def.exactLength) {
    setResponseValueAndErrors(
      res,
      "minItems",
      def.exactLength.value,
      def.exactLength.message,
      refs,
    );
    setResponseValueAndErrors(
      res,
      "maxItems",
      def.exactLength.value,
      def.exactLength.message,
      refs,
    );
  }
  return res;
};
