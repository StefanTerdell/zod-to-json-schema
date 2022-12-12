import Ajv from "ajv";
import { JSONSchema7 } from "json-schema";
import { z } from "zod";
import { zodToJsonSchema } from "../src/zodToJsonSchema";
const ajv = new Ajv();
const deref = require("json-schema-deref-sync");

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
      $schema: "http://json-schema.org/draft-07/schema#",
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

    const parsedSchema = zodToJsonSchema(someAddresses);
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
      $schema: "http://json-schema.org/draft-07/schema#",
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

    const parsedSchema = zodToJsonSchema(schema);
    expect(parsedSchema).toStrictEqual(expectedJsonSchema);
    expect(ajv.validateSchema(parsedSchema!)).toEqual(true);

    const resolvedSchema = deref(expectedJsonSchema);
    expect(resolvedSchema.properties.part).toBe(
      resolvedSchema.properties.union.anyOf[0]
    );
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

    const parsedSchema = zodToJsonSchema(categorySchema);

    const expectedJsonSchema = {
      $schema: "http://json-schema.org/draft-07/schema#",
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

    const resolvedSchema = deref(parsedSchema);
    expect(resolvedSchema.properties.subcategories.items).toBe(resolvedSchema);
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

    const parsedSchema = zodToJsonSchema(inObjectSchema);

    const expectedJsonSchema = {
      $schema: "http://json-schema.org/draft-07/schema#",
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

  it("should work with relative references", () => {
    const recurringSchema = z.string();
    const objectSchema = z.object({
      foo: recurringSchema,
      bar: recurringSchema,
    });

    const jsonSchema = zodToJsonSchema(objectSchema, {
      $refStrategy: "relative",
    });

    const exptectedResult: JSONSchema7 = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {
        foo: {
          type: "string",
        },
        bar: {
          $ref: "1/foo",
        },
      },
      required: ["foo", "bar"],
      additionalProperties: false,
    };

    expect(jsonSchema).toStrictEqual(exptectedResult);
  });

  it("should be possible to override the base path", () => {
    const recurringSchema = z.string();
    const objectSchema = z.object({
      foo: recurringSchema,
      bar: recurringSchema,
    });

    const jsonSchema = zodToJsonSchema(objectSchema, {
      basePath: ["#", "lol", "xD"],
    });

    const exptectedResult: JSONSchema7 = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {
        foo: {
          type: "string",
        },
        bar: {
          $ref: "#/lol/xD/properties/foo",
        },
      },
      required: ["foo", "bar"],
      additionalProperties: false,
    };

    expect(jsonSchema).toStrictEqual(exptectedResult);
  });

  it("should be possible to override the base path with name", () => {
    const recurringSchema = z.string();
    const objectSchema = z.object({
      foo: recurringSchema,
      bar: recurringSchema,
    });

    const jsonSchema = zodToJsonSchema(objectSchema, {
      basePath: ["#", "lol", "xD"],
      name: "kex",
    });

    const exptectedResult: JSONSchema7 = {
      $schema: "http://json-schema.org/draft-07/schema#",
      $ref: "#/lol/xD/definitions/kex",
      definitions: {
        kex: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              $ref: "#/lol/xD/definitions/kex/properties/foo",
            },
          },
          required: ["foo", "bar"],
          additionalProperties: false,
        },
      },
    };

    expect(jsonSchema).toStrictEqual(exptectedResult);
  });

  it("should be possible to opt out of $ref building", () => {
    const recurringSchema = z.string();
    const objectSchema = z.object({
      foo: recurringSchema,
      bar: recurringSchema,
    });

    const jsonSchema = zodToJsonSchema(objectSchema, {
      $refStrategy: "none",
    });

    const exptectedResult: JSONSchema7 = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {
        foo: {
          type: "string",
        },
        bar: {
          type: "string",
        },
      },
      required: ["foo", "bar"],
      additionalProperties: false,
    };

    expect(jsonSchema).toStrictEqual(exptectedResult);
  });

  it("When opting out of ref building and using recursive schemas, should warn and default to any", () => {
    global.console = { ...global.console, warn: jest.fn() };

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

    const parsedSchema = zodToJsonSchema(categorySchema, {
      $refStrategy: "none",
    });

    const expectedJsonSchema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        subcategories: {
          type: "array",
          items: {},
        },
      },
      required: ["name", "subcategories"],
      additionalProperties: false,
    };

    expect(parsedSchema).toStrictEqual(expectedJsonSchema);
    expect(console.warn).toBeCalledWith(
      "Recursive reference detected at #/properties/subcategories/items! Defaulting to any"
    );
  });

  it("should be possible to override get proper references even when picking optional definitions path $defs", () => {
    const recurringSchema = z.string();
    const objectSchema = z.object({
      foo: recurringSchema,
      bar: recurringSchema,
    });

    const jsonSchema = zodToJsonSchema(objectSchema, {
      name: "hello",
      definitionPath: "$defs",
    });

    const exptectedResult = {
      $schema: "http://json-schema.org/draft-07/schema#",
      $ref: "#/$defs/hello",
      $defs: {
        hello: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              $ref: "#/$defs/hello/properties/foo",
            },
          },
          required: ["foo", "bar"],
          additionalProperties: false,
        },
      },
    };

    expect(jsonSchema).toStrictEqual(exptectedResult);
  });

  it("should be possible to override get proper references even when picking optional definitions path definitions", () => {
    const recurringSchema = z.string();
    const objectSchema = z.object({
      foo: recurringSchema,
      bar: recurringSchema,
    });

    const jsonSchema = zodToJsonSchema(objectSchema, {
      name: "hello",
      definitionPath: "definitions",
    });

    const exptectedResult = {
      $schema: "http://json-schema.org/draft-07/schema#",
      $ref: "#/definitions/hello",
      definitions: {
        hello: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              $ref: "#/definitions/hello/properties/foo",
            },
          },
          required: ["foo", "bar"],
          additionalProperties: false,
        },
      },
    };

    expect(jsonSchema).toStrictEqual(exptectedResult);
  });

  it("should preserve correct $ref when overriding name with string", () => {
    const recurringSchema = z.string();
    const objectSchema = z.object({
      foo: recurringSchema,
      bar: recurringSchema,
    });

    const jsonSchema = zodToJsonSchema(objectSchema, "hello");

    const exptectedResult = {
      $schema: "http://json-schema.org/draft-07/schema#",
      $ref: "#/definitions/hello",
      definitions: {
        hello: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              $ref: "#/definitions/hello/properties/foo",
            },
          },
          required: ["foo", "bar"],
          additionalProperties: false,
        },
      },
    };

    expect(jsonSchema).toStrictEqual(exptectedResult);
  });

  it("should preserve correct $ref when overriding name with object property", () => {
    const recurringSchema = z.string();
    const objectSchema = z.object({
      foo: recurringSchema,
      bar: recurringSchema,
    });

    const jsonSchema = zodToJsonSchema(objectSchema, { name: "hello" });

    const exptectedResult = {
      $schema: "http://json-schema.org/draft-07/schema#",
      $ref: "#/definitions/hello",
      definitions: {
        hello: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              $ref: "#/definitions/hello/properties/foo",
            },
          },
          required: ["foo", "bar"],
          additionalProperties: false,
        },
      },
    };

    expect(jsonSchema).toStrictEqual(exptectedResult);
  });

  it("should be possible to preload a single definition", () => {
    const myRecurringSchema = z.string();
    const myObjectSchema = z.object({
      a: myRecurringSchema,
      b: myRecurringSchema,
    });

    const myJsonSchema = zodToJsonSchema(myObjectSchema, {
      definitions: { myRecurringSchema },
    });

    expect(myJsonSchema).toStrictEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      required: ["a", "b"],
      properties: {
        a: {
          $ref: "#/definitions/myRecurringSchema",
        },
        b: {
          $ref: "#/definitions/myRecurringSchema",
        },
      },
      additionalProperties: false,
      definitions: {
        myRecurringSchema: {
          type: "string",
        },
      },
    });
  });

  it("should be possible to preload multiple definitions", () => {
    const myRecurringSchema = z.string();
    const mySecondRecurringSchema = z.object({
      x: myRecurringSchema,
    });
    const myObjectSchema = z.object({
      a: myRecurringSchema,
      b: mySecondRecurringSchema,
      c: mySecondRecurringSchema,
    });

    const myJsonSchema = zodToJsonSchema(myObjectSchema, {
      definitions: { myRecurringSchema, mySecondRecurringSchema },
    });

    expect(myJsonSchema).toStrictEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      required: ["a", "b", "c"],
      properties: {
        a: {
          $ref: "#/definitions/myRecurringSchema",
        },
        b: {
          $ref: "#/definitions/mySecondRecurringSchema",
        },
        c: {
          $ref: "#/definitions/mySecondRecurringSchema",
        },
      },
      additionalProperties: false,
      definitions: {
        myRecurringSchema: {
          type: "string",
        },
        mySecondRecurringSchema: {
          type: "object",
          required: ["x"],
          properties: {
            x: {
              $ref: "#/definitions/myRecurringSchema",
            },
          },
          additionalProperties: false,
        },
      },
    });
  });

  it("should be possible to preload multiple definitions and have a named schema", () => {
    const myRecurringSchema = z.string();
    const mySecondRecurringSchema = z.object({
      x: myRecurringSchema,
    });
    const myObjectSchema = z.object({
      a: myRecurringSchema,
      b: mySecondRecurringSchema,
      c: mySecondRecurringSchema,
    });

    const myJsonSchema = zodToJsonSchema(myObjectSchema, {
      definitions: { myRecurringSchema, mySecondRecurringSchema },
      name: "mySchemaName",
    });

    expect(myJsonSchema).toStrictEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      $ref: "#/definitions/mySchemaName",
      definitions: {
        mySchemaName: {
          type: "object",
          required: ["a", "b", "c"],
          properties: {
            a: {
              $ref: "#/definitions/myRecurringSchema",
            },
            b: {
              $ref: "#/definitions/mySecondRecurringSchema",
            },
            c: {
              $ref: "#/definitions/mySecondRecurringSchema",
            },
          },
          additionalProperties: false,
        },
        myRecurringSchema: {
          type: "string",
        },
        mySecondRecurringSchema: {
          type: "object",
          required: ["x"],
          properties: {
            x: {
              $ref: "#/definitions/myRecurringSchema",
            },
          },
          additionalProperties: false,
        },
      },
    });
  });

  it("should be possible to preload multiple definitions and have a named schema and set the definitions path", () => {
    const myRecurringSchema = z.string();
    const mySecondRecurringSchema = z.object({
      x: myRecurringSchema,
    });
    const myObjectSchema = z.object({
      a: myRecurringSchema,
      b: mySecondRecurringSchema,
      c: mySecondRecurringSchema,
    });

    const myJsonSchema = zodToJsonSchema(myObjectSchema, {
      definitions: { myRecurringSchema, mySecondRecurringSchema },
      name: "mySchemaName",
      definitionPath: "$defs",
    });

    expect(myJsonSchema).toStrictEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      $ref: "#/$defs/mySchemaName",
      $defs: {
        mySchemaName: {
          type: "object",
          required: ["a", "b", "c"],
          properties: {
            a: {
              $ref: "#/$defs/myRecurringSchema",
            },
            b: {
              $ref: "#/$defs/mySecondRecurringSchema",
            },
            c: {
              $ref: "#/$defs/mySecondRecurringSchema",
            },
          },
          additionalProperties: false,
        },
        myRecurringSchema: {
          type: "string",
        },
        mySecondRecurringSchema: {
          type: "object",
          required: ["x"],
          properties: {
            x: {
              $ref: "#/$defs/myRecurringSchema",
            },
          },
          additionalProperties: false,
        },
      },
    });
  });

  it("should be possible to preload a single definition with custom basePath", () => {
    const myRecurringSchema = z.string();
    const myObjectSchema = z.object({
      a: myRecurringSchema,
      b: myRecurringSchema,
    });

    const myJsonSchema = zodToJsonSchema(myObjectSchema, {
      definitions: { myRecurringSchema },
      basePath: ["hello"],
    });

    expect(myJsonSchema).toStrictEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      required: ["a", "b"],
      properties: {
        a: {
          $ref: "hello/definitions/myRecurringSchema",
        },
        b: {
          $ref: "hello/definitions/myRecurringSchema",
        },
      },
      additionalProperties: false,
      definitions: {
        myRecurringSchema: {
          type: "string",
        },
      },
    });
  });

  it("should be possible to preload a single definition with custom basePath and name", () => {
    const myRecurringSchema = z.string();
    const myObjectSchema = z.object({
      a: myRecurringSchema,
      b: myRecurringSchema,
    });

    const myJsonSchema = zodToJsonSchema(myObjectSchema, {
      definitions: { myRecurringSchema },
      basePath: ["hello"],
      name: "kex",
    });

    expect(myJsonSchema).toStrictEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      $ref: "hello/definitions/kex",
      definitions: {
        kex: {
          type: "object",
          required: ["a", "b"],
          properties: {
            a: {
              $ref: "hello/definitions/myRecurringSchema",
            },
            b: {
              $ref: "hello/definitions/myRecurringSchema",
            },
          },
          additionalProperties: false,
        },
        myRecurringSchema: {
          type: "string",
        },
      },
    });
  });

  it("should be possible for a preloaded definition to circularly reference itself", () => {
    const myRecurringSchema: any = z.object({
      circular: z.lazy(() => myRecurringSchema),
    });

    const myObjectSchema = z.object({
      a: myRecurringSchema,
      b: myRecurringSchema,
    });

    const myJsonSchema = zodToJsonSchema(myObjectSchema, {
      definitions: { myRecurringSchema },
      basePath: ["hello"],
      name: "kex",
    });

    expect(myJsonSchema).toStrictEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      $ref: "hello/definitions/kex",
      definitions: {
        kex: {
          type: "object",
          required: ["a", "b"],
          properties: {
            a: {
              $ref: "hello/definitions/myRecurringSchema",
            },
            b: {
              $ref: "hello/definitions/myRecurringSchema",
            },
          },
          additionalProperties: false,
        },
        myRecurringSchema: {
          type: "object",
          required: ["circular"],
          properties: {
            circular: {
              $ref: "hello/definitions/myRecurringSchema",
            },
          },
          additionalProperties: false,
        },
      },
    });
  });

  it("should handle the user example", () => {
    interface User {
      id: string;
      headUser?: User;
    }

    const userSchema: z.ZodType<User> = z.lazy(() =>
      z.object({
        id: z.string(),
        headUser: userSchema.optional(),
      })
    );

    const schema = z.object({ user: userSchema });

    expect(
      zodToJsonSchema(schema, {
        definitions: { userSchema },
      })
    ).toStrictEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {
        user: {
          $ref: "#/definitions/userSchema",
        },
      },
      required: ["user"],
      additionalProperties: false,
      definitions: {
        userSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            headUser: {
              $ref: "#/definitions/userSchema",
            },
          },
          required: ["id"],
          additionalProperties: false,
        },
      },
    });
  });
});
