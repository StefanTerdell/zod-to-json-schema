import Ajv from "ajv";
import { JSONSchema7 } from "json-schema";
import { z } from "zod";
import { zodToJsonSchema } from "../src/zodToJsonSchema.js";
import { suite } from "./suite.js";
const ajv = new Ajv();
import deref from "local-ref-resolver";
import { ZodJsonSchema } from "../src/parseTypes.js";

suite("Pathing", (test) => {
  test("should handle recurring properties with paths", (assert) => {
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

    const jsonSchema: ZodJsonSchema = {
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

    assert(parsedSchema, jsonSchema);
    assert(ajv.validateSchema(parsedSchema!), true);
  });

  test("Should properly reference union participants", (assert) => {
    const participant = z.object({ str: z.string() });

    const schema = z.object({
      union: z.union([participant, z.string()]),
      part: participant,
    });

    const expectedJsonSchema: ZodJsonSchema = {
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
    assert(parsedSchema, expectedJsonSchema);
    assert(ajv.validateSchema(parsedSchema!), true);

    const resolvedSchema = deref(expectedJsonSchema);
    assert(
      resolvedSchema.properties.part,
      resolvedSchema.properties.union.anyOf[0],
    );
  });

  test("Should be able to handle recursive schemas", (assert) => {
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
      }),
    );

    const parsedSchema = zodToJsonSchema(categorySchema);

    const expectedJsonSchema: ZodJsonSchema = {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        subcategories: {
          type: "array",
          items: {
            $ref: "#",
          },
        },
      },
      required: ["name", "subcategories"],
      additionalProperties: false,
    };

    assert(parsedSchema, expectedJsonSchema);
    assert(ajv.validateSchema(parsedSchema!), true);

    const resolvedSchema = deref(parsedSchema);
    assert(resolvedSchema.properties.subcategories.items, resolvedSchema);
  });

  test("Should be able to handle complex & nested recursive schemas", (assert) => {
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
      }),
    );

    const inObjectSchema = z.object({
      category: categorySchema,
    });

    const parsedSchema = zodToJsonSchema(inObjectSchema);

    const expectedJsonSchema: ZodJsonSchema = {
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

    assert(parsedSchema, expectedJsonSchema);
    assert(ajv.validateSchema(parsedSchema), true);
  });

  test("should work with relative references", (assert) => {
    const recurringSchema = z.string();
    const objectSchema = z.object({
      foo: recurringSchema,
      bar: recurringSchema,
    });

    const jsonSchema = zodToJsonSchema(objectSchema, {
      $refStrategy: "relative",
    });

    const exptectedResult: JSONSchema7 & ZodJsonSchema = {
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

    assert(jsonSchema, exptectedResult);
  });

  test("should be possible to override the base path", (assert) => {
    const recurringSchema = z.string();
    const objectSchema = z.object({
      foo: recurringSchema,
      bar: recurringSchema,
    });

    const jsonSchema = zodToJsonSchema(objectSchema, {
      basePath: ["#", "lol", "xD"],
    });

    const exptectedResult: JSONSchema7 & ZodJsonSchema = {
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

    assert(jsonSchema, exptectedResult);
  });

  test("should be possible to override the base path with name", (assert) => {
    const recurringSchema = z.string();
    const objectSchema = z.object({
      foo: recurringSchema,
      bar: recurringSchema,
    });

    const jsonSchema = zodToJsonSchema(objectSchema, {
      basePath: ["#", "lol", "xD"],
      name: "kex",
    });

    const exptectedResult: ZodJsonSchema = {
      $ref: "#/lol/xD/$defs/kex",
      $defs: {
        kex: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              $ref: "#/lol/xD/$defs/kex/properties/foo",
            },
          },
          required: ["foo", "bar"],
          additionalProperties: false,
        },
      },
    };

    assert(jsonSchema, exptectedResult);
  });

  test("should be possible to opt out of $ref building", (assert) => {
    const recurringSchema = z.string();
    const objectSchema = z.object({
      foo: recurringSchema,
      bar: recurringSchema,
    });

    const jsonSchema = zodToJsonSchema(objectSchema, {
      $refStrategy: "none",
    });

    const exptectedResult: JSONSchema7 = {
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

    assert(jsonSchema, exptectedResult);
  });

  test("When opting out of ref building and using recursive schemas, should warn and default to any", (assert) => {
    const was = console.warn;
    let warning = "";
    console.warn = (x: any) => (warning = x);

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
      }),
    );

    const parsedSchema = zodToJsonSchema(categorySchema, {
      $refStrategy: "none",
    });

    const expectedJsonSchema = {
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

    assert(parsedSchema, expectedJsonSchema);
    assert(
      warning,
      "Recursive reference detected at #/properties/subcategories/items! Defaulting to any",
    );

    console.warn = was;
  });

  test("should be possible to override get proper references even when picking optional definitions path definitions", (assert) => {
    const recurringSchema = z.string();
    const objectSchema = z.object({
      foo: recurringSchema,
      bar: recurringSchema,
    });

    const jsonSchema = zodToJsonSchema(objectSchema, {
      name: "hello",
    });

    const exptectedResult: ZodJsonSchema = {
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

    assert(jsonSchema, exptectedResult);
  });

  test("should preserve correct $ref when overriding name with string", (assert) => {
    const recurringSchema = z.string();
    const objectSchema = z.object({
      foo: recurringSchema,
      bar: recurringSchema,
    });

    const jsonSchema = zodToJsonSchema(objectSchema, "hello");

    const exptectedResult: ZodJsonSchema = {
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

    assert(jsonSchema, exptectedResult);
  });

  test("should preserve correct $ref when overriding name with object property", (assert) => {
    const recurringSchema = z.string();
    const objectSchema = z.object({
      foo: recurringSchema,
      bar: recurringSchema,
    });

    const jsonSchema = zodToJsonSchema(objectSchema, { name: "hello" });

    const exptectedResult: ZodJsonSchema = {
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

    assert(jsonSchema, exptectedResult);
  });

  test("should be possible to preload a single definition", (assert) => {
    const myRecurringSchema = z.string();
    const myObjectSchema = z.object({
      a: myRecurringSchema,
      b: myRecurringSchema,
    });

    const myJsonSchema = zodToJsonSchema(myObjectSchema, {
      definitions: { myRecurringSchema },
    });

    assert(myJsonSchema, {
      type: "object",
      required: ["a", "b"],
      properties: {
        a: {
          $ref: "#/$defs/myRecurringSchema",
        },
        b: {
          $ref: "#/$defs/myRecurringSchema",
        },
      },
      additionalProperties: false,
      $defs: {
        myRecurringSchema: {
          type: "string",
        },
      },
    });
  });

  test("should be possible to preload multiple definitions", (assert) => {
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

    assert(myJsonSchema, {
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
      $defs: {
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

  test("should be possible to preload multiple definitions and have a named schema", (assert) => {
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
      $defs: { myRecurringSchema, mySecondRecurringSchema },
      name: "mySchemaName",
    });

    assert(myJsonSchema, {
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

  test("should be possible to preload multiple definitions and have a named schema and set the definitions path", (assert) => {
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

    assert(myJsonSchema, {
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

  test("should be possible to preload a single definition with custom basePath", (assert) => {
    const myRecurringSchema = z.string();
    const myObjectSchema = z.object({
      a: myRecurringSchema,
      b: myRecurringSchema,
    });

    const myJsonSchema = zodToJsonSchema(myObjectSchema, {
      definitions: { myRecurringSchema },
      basePath: ["hello"],
    });

    assert(myJsonSchema, {
      type: "object",
      required: ["a", "b"],
      properties: {
        a: {
          $ref: "hello/$defs/myRecurringSchema",
        },
        b: {
          $ref: "hello/$defs/myRecurringSchema",
        },
      },
      additionalProperties: false,
      $defs: {
        myRecurringSchema: {
          type: "string",
        },
      },
    } satisfies ZodJsonSchema);
  });

  test("should be possible to preload a single definition with custom basePath and name", (assert) => {
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

    assert(myJsonSchema, {
      $ref: "hello/$defs/kex",
      $defs: {
        kex: {
          type: "object",
          required: ["a", "b"],
          properties: {
            a: {
              $ref: "hello/$defs/myRecurringSchema",
            },
            b: {
              $ref: "hello/$defs/myRecurringSchema",
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

  test("should be possible for a preloaded definition to circularly reference itself", (assert) => {
    const myRecurringSchema: any = z.object({
      circular: z.lazy(() => myRecurringSchema),
    });

    const myObjectSchema = z.object({
      a: myRecurringSchema,
      b: myRecurringSchema,
    });

    const myJsonSchema = zodToJsonSchema(myObjectSchema, {
      $defs: { myRecurringSchema },
      basePath: ["hello"],
      name: "kex",
    });

    assert(myJsonSchema, {
      $ref: "hello/$defs/kex",
      $defs: {
        kex: {
          type: "object",
          required: ["a", "b"],
          properties: {
            a: {
              $ref: "hello/$defs/myRecurringSchema",
            },
            b: {
              $ref: "hello/$defs/myRecurringSchema",
            },
          },
          additionalProperties: false,
        },
        myRecurringSchema: {
          type: "object",
          required: ["circular"],
          properties: {
            circular: {
              $ref: "hello/$defs/myRecurringSchema",
            },
          },
          additionalProperties: false,
        },
      },
    });
  });

  test("should handle the user example", (assert) => {
    interface User {
      id: string;
      headUser?: User;
    }

    const userSchema: z.ZodType<User> = z.lazy(() =>
      z.object({
        id: z.string(),
        headUser: userSchema.optional(),
      }),
    );

    const schema = z.object({ user: userSchema });

    assert(
      zodToJsonSchema(schema, {
        $defs: { userSchema },
      }),
      {
        type: "object",
        properties: {
          user: {
            $ref: "#/$defs/userSchema",
          },
        },
        required: ["user"],
        additionalProperties: false,
        $defs: {
          userSchema: {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
              headUser: {
                $ref: "#/$defs/userSchema",
              },
            },
            required: ["id"],
            additionalProperties: false,
          },
        },
      },
    );
  });

  test("should handle mutual recursion", (assert) => {
    const leafSchema = z.object({
      prop: z.string(),
    });

    let nodeChildSchema: z.ZodType;

    const nodeSchema = z.object({
      children: z.lazy(() => z.array(nodeChildSchema)),
    });

    nodeChildSchema = z.union([leafSchema, nodeSchema]);

    const treeSchema = z.object({
      nodes: nodeSchema,
    });

    assert(
      zodToJsonSchema(treeSchema, {
        name: "Tree",
        $defs: {
          Leaf: leafSchema,
          NodeChild: nodeChildSchema,
          Node: nodeSchema,
        },
      }),
      {
        $ref: "#/$defs/Tree",
        $defs: {
          Leaf: {
            type: "object",
            properties: {
              prop: {
                type: "string",
              },
            },
            required: ["prop"],
            additionalProperties: false,
          },
          Node: {
            type: "object",
            properties: {
              children: {
                type: "array",
                items: {
                  $ref: "#/$defs/NodeChild",
                },
              },
            },
            required: ["children"],
            additionalProperties: false,
          },
          NodeChild: {
            anyOf: [
              {
                $ref: "#/$defs/Leaf",
              },
              {
                $ref: "#/$defs/Node",
              },
            ],
          },
          Tree: {
            type: "object",
            properties: {
              nodes: {
                $ref: "#/$defs/Node",
              },
            },
            required: ["nodes"],
            additionalProperties: false,
          },
        },
      },
    );
  });

  test("should not fail when definition is lazy", (assert) => {
    const lazyString = z.lazy(() => z.string());

    const lazyObject = z.lazy(() => z.object({ lazyProp: lazyString }));

    const jsonSchema = zodToJsonSchema(lazyObject, {
      $defs: { lazyString },
    });

    const expected = {
      type: "object",
      properties: { lazyProp: { $ref: "#/$defs/lazyString" } },
      required: ["lazyProp"],
      additionalProperties: false,
      $defs: { lazyString: { type: "string" } },
    };

    assert(jsonSchema, expected);
  });
});
