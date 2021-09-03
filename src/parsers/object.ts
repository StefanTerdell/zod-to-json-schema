import { ZodObjectDef } from "zod";
import { JsonSchema7Type, parseDef, Visited } from "../parseDef";

export type JsonSchema7ObjectType = {
  type: "object";
  properties: Record<string, JsonSchema7Type>;
  additionalProperties: boolean | JsonSchema7Type;
  required?: string[];
};

export function parseObjectDef(
  def: ZodObjectDef,
  path: string[],
  visited: Visited
) {
  const result: JsonSchema7ObjectType = {
    type: "object",
    ...Object.entries(def.shape()).reduce(
      (
        acc: { properties: Record<string, JsonSchema7Type>; required: string[] },
        [propName, propDef]
      ) => {
        if (propDef === undefined || propDef._def === undefined) return acc;
        const parsedDef = parseDef(
          propDef._def,
          [...path, "properties", propName],
          visited
        );
        if (parsedDef === undefined) return acc;
        return {
          properties: { ...acc.properties, [propName]: parsedDef },
          required: propDef.isOptional()
            ? acc.required
            : [...acc.required, propName],
        };
      },
      { properties: {}, required: [] }
    ),
    additionalProperties:
      def.catchall._def.typeName === "ZodNever"
        ? def.unknownKeys === "passthrough"
        : parseDef(def.catchall._def, [...path, 'additionalProperties'], visited) ?? true,
  };
  if (!result.required!.length) delete result.required
  return result;
}
