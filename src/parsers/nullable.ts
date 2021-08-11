import { ZodNullableDef } from "zod";
import { JsonSchema7Type, parseDef, Visited } from "../parseDef";
import { JsonSchema7NullType } from "./null";

export type JsonSchema7NullableType =
  | {
      anyOf: [JsonSchema7Type, JsonSchema7NullType];
    }
  | {
      type: [string, "null"];
    };

export function parseNullableDef(
  def: ZodNullableDef,
  path: string[],
  visited: Visited
): JsonSchema7NullableType | undefined {
  const type = parseDef(def.innerType, path, visited);

  if (!type) return undefined;

  if (
    "type" in type &&
    typeof type.type === "string" &&
    ["string", "number", "boolean", "integer"].includes(type.type)
  ) {
    return { type: [type.type, "null"] };
  } else {
    return {
      anyOf: [
        type,
        {
          type: "null",
        },
      ],
    };
  }
}
