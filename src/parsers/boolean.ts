import { JsonSchema } from "../JsonSchema";

export function parseBooleanDef(): JsonSchema {
  return {
    type: "boolean",
  };
}
