import Ajv from "ajv";
import { z } from "zod";
import { parseDef } from "../src/parseDef";
const ajv = new Ajv();

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

    const parsedSchema = parseDef(someAddresses._def, [], []);
    expect(parsedSchema).toStrictEqual(jsonSchema);
    expect(ajv.validateSchema(parsedSchema!)).toEqual(true);
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

    const parsedSchema = parseDef(schema._def, [], []);
    expect(parsedSchema).toStrictEqual(expectedJsonSchema);
    expect(ajv.validateSchema(parsedSchema!)).toEqual(true);
  });

  it("Should be able to handle recursive schemas", () => {
    type Category = {
      name: string;
      subcategories: Category[];
    };

    // cast to z.ZodSchema<Category>
    // @ts-ignore
    const categorySchema: z.ZodSchema<Category> = z.lazy(() =>
      z.object({
        name: z.string(),
        subcategories: z.array(categorySchema),
      })
    );

    const parsedSchema = parseDef(categorySchema._def, [], []);

    const expectedJsonSchema = {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        subcategories: {
          type: "array",
          items: {
            $ref: "#/",
          },
        },
      },
      required: ["name", "subcategories"],
      additionalProperties: false,
    };

    expect(parsedSchema).toStrictEqual(expectedJsonSchema);
    expect(ajv.validateSchema(parsedSchema!)).toEqual(true);
  });

  it("Should be able to handle complex & nested recursive schemas", () => {
    type Category = {
      name: string;
      inner: {
        subcategories?: Record<string, Category> | null;
      };
    };

    // cast to z.ZodSchema<Category>
    // @ts-ignore
    const categorySchema: z.ZodSchema<Category> = z.lazy(() =>
      z.object({
        name: z.string(),
        inner: z.object({
          subcategories: z.record(categorySchema).nullable().optional(),
        }),
      })
    );

    const inObjectSchema = z.object({
      category: categorySchema,
    });

    const parsedSchema = parseDef(inObjectSchema._def, [], []);

    const expectedJsonSchema = {
      type: "object",
      additionalProperties: false,
      required: ["category"],
      properties: {
        category: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            inner: {
              type: "object",
              additionalProperties: false,
              properties: {
                subcategories: {
                  anyOf: [
                    {
                      type: "object",
                      additionalProperties: {
                        $ref: "#/properties/category",
                      },
                    },
                    {
                      type: "null",
                    },
                  ],
                },
              },
            },
          },
          required: ["name", "inner"],
          additionalProperties: false,
        },
      },
    };

    expect(parsedSchema).toStrictEqual(expectedJsonSchema);
    expect(ajv.validateSchema(parsedSchema!)).toEqual(true);
  });
});
