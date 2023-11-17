import { ZodEffectsDef } from "zod";
import { parseDef } from "../parseDef.js";
import { Refs } from "../Refs.js";
import { JsonSchema } from "../JsonSchema.js";

export function parseEffectsDef(
  _def: ZodEffectsDef,
  refs: Refs
): JsonSchema | undefined {
  return refs.effectStrategy === "input"
    ? parseDef(_def.schema._def, refs)
    : {};
}
