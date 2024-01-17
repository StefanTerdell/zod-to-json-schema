import { ZodPromiseDef } from "zod";
import { JsonSchema7Type, parseDef } from "../parseDef.js";
import { Refs } from "../Refs.js";

export function parsePromiseDef(
  def: ZodPromiseDef,
  refs: Refs,
): JsonSchema7Type | undefined {
  return parseDef(def.type._def, refs);
}
