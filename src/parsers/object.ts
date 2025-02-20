import { ZodObjectDef, ZodOptional } from "zod";
import { parseDef } from "../parseDef.js";
import { JsonSchema7Type } from "../parseTypes.js";
import { Refs } from "../Refs.js";

function decideAdditionalProperties(def: ZodObjectDef, refs: Refs) {
  if (refs.removeAdditionalStrategy === "strict") {
    return def.catchall._def.typeName === "ZodNever"
      ? def.unknownKeys !== "strict"
      : parseDef(def.catchall._def, {
          ...refs,
          currentPath: [...refs.currentPath, "additionalProperties"],
        }) ?? true;
  } else {
    return def.catchall._def.typeName === "ZodNever"
      ? def.unknownKeys === "passthrough"
      : parseDef(def.catchall._def, {
          ...refs,
          currentPath: [...refs.currentPath, "additionalProperties"],
        }) ?? true;
  }
}

export type JsonSchema7ObjectType = {
  type: "object";
  properties: Record<string, JsonSchema7Type>;
  additionalProperties: boolean | JsonSchema7Type;
  required?: string[];
};

export function parseObjectDef(def: ZodObjectDef, refs: Refs) {
  const forceOptionalIntoNullable = refs.target === "openAi";

  const result: JsonSchema7ObjectType = {
    type: "object",
    ...Object.entries(def.shape()).reduce(
      (
        acc: {
          properties: Record<string, JsonSchema7Type>;
          required: string[];
        },
        [propName, propDef],
      ) => {
        if (propDef === undefined || propDef._def === undefined) return acc;

        let propOptional = propDef.isOptional();

        if (propOptional && forceOptionalIntoNullable) {
          if (propDef instanceof ZodOptional) {
            propDef = propDef._def.innerType;
          }

          if (!propDef.isNullable()) {
            propDef = propDef.nullable();
          }

          propOptional = false;
        }

        const parsedDef = parseDef(propDef._def, {
          ...refs,
          currentPath: [...refs.currentPath, "properties", propName],
          propertyPath: [...refs.currentPath, "properties", propName],
        });
        if (parsedDef === undefined) return acc;
        return {
          properties: { ...acc.properties, [propName]: parsedDef },
          required: propOptional ? acc.required : [...acc.required, propName],
        };
      },
      { properties: {}, required: [] },
    ),
    additionalProperties: decideAdditionalProperties(def, refs),
  };
  if (!result.required!.length) delete result.required;
  return result;
}
