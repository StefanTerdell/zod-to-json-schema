import { ZodSetDef } from "zod";
import { JsonSchema7Type, parseDef } from "../parseDef";
import { References } from "../References";

export type JsonSchema7SetType = {
  type: "array";
  items?: JsonSchema7Type;
};

export function parseSetDef(
  def: ZodSetDef,
  refs: References
): JsonSchema7SetType {
  const items = parseDef(def.valueType._def, refs.addToPath("items"));
  return { type: "array", items };
}
