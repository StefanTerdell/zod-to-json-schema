import { z } from "zod";
import { zodToJsonSchema } from "../src/zodToJsonSchema.js";
import { suite } from "./suite.js";

suite("Root schema result after parsing", (it) => {
  it("should return the schema directly in the root if no name is passed", (assert) => {
    assert(zodToJsonSchema(z.any()), {});
  });

  it('should return the schema inside a named property in "$defs" if a name is passed', (assert) => {
    assert(zodToJsonSchema(z.any(), "MySchema"), {
      $ref: `#/$defs/MySchema`,
      $defs: {
        MySchema: {},
      },
    });
  });

  it("should not scrub 'any'-schemas from unions when strictUnions=false", (assert) => {
    assert(
      zodToJsonSchema(
        z.union([z.any(), z.instanceof(String), z.string(), z.number()]),
        { strictUnions: false },
      ),
      {
        anyOf: [{}, {}, { type: "string" }, { type: "number" }],
      },
    );
  });

  it("should scrub 'any'-schemas from unions when strictUnions=true", (assert) => {
    assert(
      zodToJsonSchema(
        z.union([z.any(), z.instanceof(String), z.string(), z.number()]),
        { strictUnions: true },
      ),
      {
        anyOf: [{ type: "string" }, { type: "number" }],
      },
    );
  });

  it("should scrub 'any'-schemas from unions when strictUnions=true in objects", (assert) => {
    assert(
      zodToJsonSchema(
        z.object({
          field: z.union([
            z.any(),
            z.instanceof(String),
            z.string(),
            z.number(),
          ]),
        }),
        { strictUnions: true },
      ),
      {
        type: "object",
        properties: {
          field: { anyOf: [{ type: "string" }, { type: "number" }] },
        },
        additionalProperties: false,
      },
    );
  });

  it("Definitions play nice with named schemas", (assert) => {
    const MySpecialStringSchema = z.string();
    const MyArraySchema = z.array(MySpecialStringSchema);

    const result = zodToJsonSchema(MyArraySchema, {
      $defs: {
        MySpecialStringSchema,
        MyArraySchema,
      },
    });

    assert(result, {
      $ref: "#/$defs/MyArraySchema",
      $defs: {
        MySpecialStringSchema: { type: "string" },
        MyArraySchema: {
          type: "array",
          items: {
            $ref: "#/$defs/MySpecialStringSchema",
          },
        },
      },
    });
  });

  it("should be possible to add name as title instead of as ref", (assert) => {
    assert(
      zodToJsonSchema(z.string(), { name: "hello", nameStrategy: "title" }),
      {
        type: "string",
        title: "hello",
      },
    );
  });
});
