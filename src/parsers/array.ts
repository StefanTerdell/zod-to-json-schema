import { ZodArrayDef, ZodTypeDef } from "zod";
import { JsonSchema7Type, parseDef, Visited } from "../parseDef";

export type JsonSchema7ArrayType = {
  type: "array";
  items?: JsonSchema7Type;
  minItems?: number;
  maxItems?: number;
};

export function parseArrayDef(
  def: ZodArrayDef,
  path: string[],
  visited: Visited
) {
  {
    const res: JsonSchema7ArrayType = {
      type: "array",
      items: parseDef(def.type, [...path, "items"], visited),
    };
    if (def.minLength) {
      res.minItems = def.minLength.value;
    }
    if (def.maxLength) {
      res.maxItems = def.maxLength.value;
    }

    return res;
  }
}
