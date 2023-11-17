import { JsonSchema } from "../JsonSchema";

export function parseUndefinedDef(): JsonSchema {
  return {
    not: {},
  };
}
