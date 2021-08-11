import { ZodObjectDef } from "zod";
import { JsonSchema7Type, parseDef, Visited } from "../parseDef";

export type JsonSchema7ObjectType = {
  type: "object";
  properties: Record<string, JsonSchema7Type>;
  additionalProperties: boolean;
  required?: string[];
};

export function parseObjectDef(
  def: ZodObjectDef,
  path: string[],
  visited: Visited
) {
  const entries = Object.entries(def.shape()).filter(
    ([, value]) => value !== undefined && value._def !== undefined
  );

  const result: JsonSchema7ObjectType = {
    type: "object",
    properties: entries
      .map(([key, value]) => ({
        key,
        value: parseDef(value, [...path, "properties", key], visited),
      }))
      .filter(({ value }) => value !== undefined)
      .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {}),
    additionalProperties: def.unknownKeys === "passthrough",
  };
  const required = Object.entries(def.shape())
    .filter(([, value]) => value !== undefined && value._def !== undefined)
    .filter(([, value]) => {
      return !value.isOptional();
    })
    .map(([key]) => key);
  if (required.length) {
    result.required = required;
  }
  return result;
}
