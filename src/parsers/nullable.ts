import { ZodNullableDef } from "zod";
import { JsonSchema7Type, parseDef, Visited } from "../parseDef";
import { JsonSchema7NullType } from "./null";
import { primitiveMappings } from "./union";

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
  if (
    ["ZodString", "ZodNumber", "ZodBigInt", "ZodBoolean", "ZodNull"].includes(
      def.innerType._def.typeName
    ) &&
    (!def.innerType._def.checks || !def.innerType._def.checks.length)
  ) {
    return {
      type: [
        primitiveMappings[
          def.innerType._def.typeName as keyof typeof primitiveMappings
        ],
        "null",
      ],
    };
  }

  const type = parseDef(def.innerType._def, [...path, 'anyOf', '0'], visited);

  return type
    ? {
        anyOf: [
          type,
          {
            type: "null",
          },
        ],
      }
    : undefined;
}
