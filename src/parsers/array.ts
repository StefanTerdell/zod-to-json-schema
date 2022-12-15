import { ZodArrayDef, ZodFirstPartyTypeKind } from "zod";
import { ErrorMessages, setResponseValueAndErrors } from "../errorMessages";
import { JsonSchema7Type, parseDef } from "../parseDef";
import { References } from "../References";

export type JsonSchema7ArrayType = {
  type: "array";
  items?: JsonSchema7Type;
  minItems?: number;
  maxItems?: number;
  errorMessages?: ErrorMessages<JsonSchema7ArrayType, "items">;
};

export function parseArrayDef(def: ZodArrayDef, refs: References) {
  const res: JsonSchema7ArrayType = {
    type: "array",
  };
  if (def.type?._def?.typeName !== ZodFirstPartyTypeKind.ZodAny) {
    res.items = parseDef(def.type._def, refs.addToPath("items"));
  }
  if (def.minLength) {
    setResponseValueAndErrors(
      res,
      "minItems",
      def.minLength.value,
      def.minLength.message,
      refs
    );
  }
  if (def.maxLength) {
    setResponseValueAndErrors(
      res,
      "maxItems",
      def.maxLength.value,
      def.maxLength.message,
      refs
    );
  }

  return res;
}
