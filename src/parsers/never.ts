import { JsonSchema } from "../JsonSchema";

export function parseNeverDef(): JsonSchema {
  return {
    not: {},
  };
}
