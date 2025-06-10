import { ZodObjectDef, ZodOptional, ZodTypeAny } from "zod";
import { parseDef } from "../parseDef.js";
import { Refs } from "../Refs.js";
import { DefParser, ZodJsonSchema, ensureObjectSchema } from "../parseTypes.js";

export const parseObjectDef: DefParser<ZodObjectDef> = (def, refs) => {
  const result: ReturnType<typeof parseObjectDef> = {
    type: "object",
  };

  const shape = def.shape();

  for (const propName in shape) {
    let propDef = shape[propName];

    if (propDef === undefined || propDef._def === undefined) {
      continue;
    }

    let propOptional = safeIsOptional(propDef);

    if (propOptional) {
      if (propDef instanceof ZodOptional) {
        propDef = propDef._def.innerType;
      }
    }

    const parsedDef = ensureObjectSchema(
      parseDef(propDef._def, {
        ...refs,
        currentPath: [...refs.currentPath, "properties", propName],
        propertyPath: [...refs.currentPath, "properties", propName],
      }),
    );

    if (parsedDef === null) {
      continue;
    }

    if (result.properties) {
      result.properties[propName] = parsedDef;
    } else {
      result.properties = {
        [propName]: parsedDef,
      };
    }

    if (!propOptional) {
      if (result.required) {
        result.required.push(propName);
      } else {
        result.required = [propName];
      }
    }
  }

  const additionalProperties = decideAdditionalProperties(def, refs);

  if (additionalProperties !== null) {
    result.additionalProperties = additionalProperties;
  }

  return result;
};

function decideAdditionalProperties(
  def: ZodObjectDef,
  refs: Refs,
): ZodJsonSchema<true> | boolean | null {
  if (def.catchall._def.typeName !== "ZodNever") {
    return parseDef(def.catchall._def, {
      ...refs,
      currentPath: [...refs.currentPath, "additionalProperties"],
    });
  }

  switch (def.unknownKeys) {
    case "passthrough":
      return refs.allowedAdditionalProperties ?? null;
    case "strict":
      return refs.rejectedAdditionalProperties ?? null;
    case "strip":
      return refs.removeAdditionalStrategy === "strict"
        ? (refs.allowedAdditionalProperties ?? null)
        : (refs.rejectedAdditionalProperties ?? null);
  }
}

function safeIsOptional(schema: ZodTypeAny): boolean {
  try {
    return schema.isOptional();
  } catch {
    return true;
  }
}
