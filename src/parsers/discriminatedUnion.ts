import { ZodDiscriminatedUnionDef, ZodDiscriminatedUnionOption, ZodLiteral } from "zod";
import { parseDef } from "../parseDef.js";
import { Refs } from "../Refs.js";
import { JSONSchema7Object } from "json-schema";
import { parseUnionDef } from "./union";
import { omit } from "radash";

type JsonSchema7DiscriminatedUnionUsingConditionsType<Discriminator extends string> = {
  type: "object",
  properties: {
    [K in Discriminator]: {
      type: "string", // TODO support numbers as discriminators too?
      enum: string[];
    };
  },
  required: [Discriminator],
  allOf: {
    if: {
      properties: {
        [K in Discriminator]: {
          const: string;
        }
      }
    },
    then: JSONSchema7Object;
  }[];
  unevaluatedProperties: false; // TODO only set this if any of the then-schemas has unevaluatedProperties or additionalProperties set to false
};

export function parseDiscriminatedUnionDef(
  def: ZodDiscriminatedUnionDef<any, any>,
  refs: Refs
): JsonSchema7DiscriminatedUnionUsingConditionsType<any> | ReturnType<typeof parseUnionDef> {
  if (refs.target === "openApi3") return parseUnionDef(def, refs);
  const discriminator = def.discriminator;
  const options: readonly ZodDiscriminatedUnionOption<string>[] =
    def.options instanceof Map ? Array.from(def.options.values()) : def.options;
  const discriminatorValues = options.map(option => {
    let discriminatorType = option._def.shape()[discriminator];
    if ((discriminatorType as ZodLiteral<string>)._def.typeName !== "ZodLiteral") {
      throw new Error("Discriminated union must be composed of literal types");
    }
    return (discriminatorType as ZodLiteral<string>)._def.value;
  });
  return {
    type: "object",
    properties: {
      [discriminator]: {
        type: "string",
        enum: discriminatorValues
      }
    },
    required: [discriminator],
    allOf: options.map((option, i) => {
      const defWithoutDiscriminator = option.omit({
        [discriminator]: true
      });
      const thenJsonObject = omit(parseDef(defWithoutDiscriminator._def, {
        ...refs,
        currentPath: [...refs.currentPath, "allOf", `${i}`, "then"],
        propertyPath: undefined
      }), ["additionalProperties"] as any);
      return ({
        if: {
          properties: {
            [discriminator]: {
              const: discriminatorValues[i]
            }
          }
        },
        then: thenJsonObject as JSONSchema7Object
      });
    }),
    unevaluatedProperties: false
  };
}
