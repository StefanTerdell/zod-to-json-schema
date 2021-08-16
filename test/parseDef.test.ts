import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parseDef } from "../src/parseDef";
import Ajv from "ajv";
const ajv = new Ajv()
describe("Basic parsing", () => {
  it("should return a proper json schema with some common types without validation", () => {
    const zodSchema = z.object({
      requiredString: z.string(),
      optionalString: z.string().optional(),
      literalString: z.literal("literalStringValue"),
      stringArray: z.array(z.string()),
      stringEnum: z.enum(["stringEnumOptionA", "stringEnumOptionB"]),
      tuple: z.tuple([z.string(), z.number(), z.boolean()]),
      record: z.record(z.boolean()),
      requiredNumber: z.number(),
      optionalNumber: z.number().optional(),
      numberOrNull: z.number().nullable(),
      numberUnion: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      mixedUnion: z.union([
        z.literal("abc"),
        z.literal(123),
        z.object({ nowItGetsAnnoying: z.literal(true) }),
      ]),
      objectOrNull: z.object({ myString: z.string() }).nullable(),
      passthrough: z.object({ myString: z.string() }).passthrough()
    });
    const expectedJsonSchema: JSONSchema7Type = {
      type: "object",
      properties: {
        requiredString: {
          type: "string",
        },
        optionalString: {
          type: "string",
        },
        literalString: {
          type: "string",
          const: "literalStringValue",
        },
        stringArray: {
          type: "array",
          items: {
            type: "string",
          },
        },
        stringEnum: {
          type: "string",
          enum: ["stringEnumOptionA", "stringEnumOptionB"],
        },
        tuple: {
          type: "array",
          minItems: 3,
          items: [
            {
              type: "string",
            },
            {
              type: "number",
            },
            {
              type: "boolean",
            },
          ],
          maxItems: 3,
        },
        record: {
          type: "object",
          additionalProperties: {
            type: "boolean",
          },
        },
        requiredNumber: {
          type: "number",
        },
        optionalNumber: {
          type: "number",
        },
        numberOrNull: {
          type: ["number", "null"],
        },
        numberUnion: {
          type: "number",
          enum: [1, 2, 3],
        },
        mixedUnion: {
          anyOf: [
            {
              type: "string",
              const: "abc",
            },
            {
              type: "number",
              const: 123,
            },
            {
              type: "object",
              properties: {
                nowItGetsAnnoying: {
                  type: "boolean",
                  const: true,
                },
              },
              required: ["nowItGetsAnnoying"],
              additionalProperties: false,
            },
          ],
        },
        objectOrNull: {
          anyOf: [
            {
              type: "object",
              properties: {
                myString: {
                  type: "string",
                },
              },
              required: ["myString"],
              additionalProperties: false,
            },
            {
              type: "null",
            },
          ],
        },
        passthrough: {
          type: "object",
          properties: {
            myString: {
              type: "string",
            },
          },
          required: ["myString"],
          additionalProperties: true,
        },
      },
      required: [
        "requiredString",
        "literalString",
        "stringArray",
        "stringEnum",
        "tuple",
        "record",
        "requiredNumber",
        "numberOrNull",
        "numberUnion",
        "mixedUnion",
        "objectOrNull",
        "passthrough"
      ],
      additionalProperties: false,
    };
    const parsedSchema = parseDef(zodSchema, [], [])
    expect(parsedSchema).toStrictEqual(expectedJsonSchema);
    expect(ajv.validateSchema(parsedSchema!)).toEqual(true)
  });
});

describe("Pathing", () => {
  it("should handle recurring properties with paths", () => {
    const addressSchema = z.object({
      street: z.string(),
      number: z.number(),
      city: z.string(),
    });
    const someAddresses = z.object({
      address1: addressSchema,
      address2: addressSchema,
      lotsOfAddresses: z.array(addressSchema),
    });
    const jsonSchema = {
      type: "object",
      properties: {
        address1: {
          type: "object",
          properties: {
            street: { type: "string" },
            number: { type: "number" },
            city: { type: "string" },
          },
          additionalProperties: false,
          required: ["street", "number", "city"],
        },
        address2: { $ref: "#/properties/address1" },
        lotsOfAddresses: {
          type: "array",
          items: { $ref: "#/properties/address1" },
        },
      },
      additionalProperties: false,
      required: ["address1", "address2", "lotsOfAddresses"],
    };

    const parsedSchema = parseDef(someAddresses, [], [])
    expect(parsedSchema).toStrictEqual(jsonSchema);
    expect(ajv.validateSchema(parsedSchema!)).toEqual(true)
  });

  it("Should properly reference union participants", () => {
    const participant = z.object({ str: z.string() });

    const schema = z.object({
      union: z.union([participant, z.string()]),
      part: participant,
    });

    const expectedJsonSchema = {
      type: "object",
      properties: {
        union: {
          anyOf: [
            {
              type: "object",
              properties: {
                str: {
                  type: "string",
                },
              },
              additionalProperties: false,
              required: ["str"],
            },
            {
              type: "string",
            },
          ],
        },
        part: {
          $ref: "#/properties/union/anyOf/0",
        },
      },
      additionalProperties: false,
      required: ["union", "part"],
    };

    const parsedSchema = parseDef(schema, [], []);
    expect(parsedSchema).toStrictEqual(expectedJsonSchema);
    expect(ajv.validateSchema(parsedSchema!)).toEqual(true)
  });

  it("Should be able to handle recursive schemas", () => 
  {
    interface Category {
      name: string;
      subcategories: Category[];
    }
    
    // cast to z.ZodSchema<Category>
    // @ts-ignore
    const categorySchema: z.ZodSchema<Category> = z.lazy(() =>
      z.object({
        name: z.string(),
        subcategories: z.array(categorySchema),
      })
    );

    const parsedSchema = parseDef(categorySchema, [], [])
    
    const expectedJsonSchema =  {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "subcategories": {
          "type": "array",
          "items": {
            "$ref": "#/"
          }
        }
      },
      "required": [
        "name",
        "subcategories"
      ],
      "additionalProperties": false
    }

    expect(parsedSchema).toStrictEqual(expectedJsonSchema);
    expect(ajv.validateSchema(parsedSchema!)).toEqual(true)
  })
});
