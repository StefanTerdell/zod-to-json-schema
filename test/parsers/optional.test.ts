import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parseDef } from "../../src/parseDef";
import { References } from "../../src/References";

describe.only("Standalone optionals", () => {
  it("should work as unions with undefined", () => {
    const parsedSchema = parseDef(z.string().optional()._def, new References());

    const jsonSchema: JSONSchema7Type = {
      anyOf: [
        {
          not: {},
        },
        {
          type: "string",
        },
      ],
    };

    expect(parsedSchema).toStrictEqual(jsonSchema);
  });

  it("should not affect object properties", () => {
    const parsedSchema = parseDef(
      z.object({ myProperty: z.string().optional() })._def,
      new References()
    );

    const jsonSchema: JSONSchema7Type = {
      type: "object",
      properties: {
        myProperty: {
          type: "string",
        },
      },
      additionalProperties: false,
    };

    expect(parsedSchema).toStrictEqual(jsonSchema);
  });

  it("should work with nested properties", () => {
    const parsedSchema = parseDef(
      z.object({ myProperty: z.string().optional().array() })._def,
      new References()
    );

    const jsonSchema: JSONSchema7Type = {
      type: "object",
      properties: {
        myProperty: {
          type: "array",
          items: {
            anyOf: [{ not: {} }, { type: "string" }],
          },
        },
      },
      required: ["myProperty"],
      additionalProperties: false,
    };

    expect(parsedSchema).toStrictEqual(jsonSchema);
  });

  it("should work with nested properties as object properties", () => {
    const parsedSchema = parseDef(
      z.object({
        myProperty: z.object({ myInnerProperty: z.string().optional() }),
      })._def,
      new References()
    );

    const jsonSchema: JSONSchema7Type = {
      type: "object",
      properties: {
        myProperty: {
          type: "object",
          properties: {
            myInnerProperty: {
              type: "string",
            },
          },
          additionalProperties: false,
        },
      },
      required: ["myProperty"],
      additionalProperties: false,
    };

    expect(parsedSchema).toStrictEqual(jsonSchema);
  });

  it("should work with nested properties with nested object property parents", () => {
    const parsedSchema = parseDef(
      z.object({
        myProperty: z.object({
          myInnerProperty: z.string().optional().array(),
        }),
      })._def,
      new References()
    );

    const jsonSchema: JSONSchema7Type = {
      type: "object",
      properties: {
        myProperty: {
          type: "object",
          properties: {
            myInnerProperty: {
              type: "array",
              items: {
                anyOf: [
                  { not: {} },
                  {
                    type: "string",
                  },
                ],
              },
            },
          },
          required: ["myInnerProperty"],
          additionalProperties: false,
        },
      },
      required: ["myProperty"],
      additionalProperties: false,
    };

    expect(parsedSchema).toStrictEqual(jsonSchema);
  });

  it("should work with ref pathing", () => {
    const recurring = z.string();

    const schema = z.tuple([recurring.optional(), recurring]);

    const parsedSchema = parseDef(schema._def, new References());

    const jsonSchema: JSONSchema7Type = {
      type: "array",
      minItems: 2,
      maxItems: 2,
      items: [
        { anyOf: [{ not: {} }, { type: "string" }] },
        { $ref: "#/items/0/anyOf/1" },
      ],
    };

    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});
