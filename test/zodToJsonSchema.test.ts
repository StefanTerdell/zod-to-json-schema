import { z } from "zod";
import { zodToJsonSchema } from "../src/zodToJsonSchema";

describe("Root schema result after parsing", () => {
  it("should return the schema directly in the root if no name is passed", () => {
    expect(zodToJsonSchema(z.any())).toStrictEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
    });
  });
  it('should return the schema inside a named property in "definitions" if a name is passed', () => {
    expect(zodToJsonSchema(z.any(), "MySchema")).toStrictEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      $ref: `#/definitions/MySchema`,
      definitions: {
        MySchema: {},
      },
    });
  });

  it('should return the schema inside a named property in "$defs" if a name and definitionPath is passed in options', () => {
    expect(
      zodToJsonSchema(z.any(), { name: "MySchema", definitionPath: "$defs" })
    ).toStrictEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      $ref: `#/$defs/MySchema`,
      $defs: {
        MySchema: {},
      },
    });
  });

  it("should not scrub 'any'-schemas from unions when strictUnions=false", () => {
    expect(
      zodToJsonSchema(
        z.union([z.any(), z.instanceof(String), z.string(), z.number()]),
        { strictUnions: false }
      )
    ).toStrictEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      anyOf: [{}, {}, { type: "string" }, { type: "number" }],
    });
  });

  it("should scrub 'any'-schemas from unions when strictUnions=true", () => {
    expect(
      zodToJsonSchema(
        z.union([z.any(), z.instanceof(String), z.string(), z.number()]),
        { strictUnions: true }
      )
    ).toStrictEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      anyOf: [{ type: "string" }, { type: "number" }],
    });
  });

  it("should scrub 'any'-schemas from unions when strictUnions=true in objects", () => {
    expect(
      zodToJsonSchema(
        z.object({
          field: z.union([
            z.any(),
            z.instanceof(String),
            z.string(),
            z.number(),
          ]),
        }),
        { strictUnions: true }
      )
    ).toStrictEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      additionalProperties: false,
      properties: {
        field: { anyOf: [{ type: "string" }, { type: "number" }] },
      },
      type: "object",
    });
  });

  it("should return undefined from z.void()", () => {
    expect(zodToJsonSchema(z.void())).toStrictEqual(undefined);
  });
});
