import { z } from "zod";
import { parseIntersectionDef } from "../../src/parsers/intersection";
import { getRefs } from "../../src/Refs";

describe("intersections", () => {
  it("should be possible to use intersections", () => {
    const intersection = z.intersection(z.string().min(1), z.string().max(3));

    const jsonSchema = parseIntersectionDef(intersection._def, getRefs());

    expect(jsonSchema).toStrictEqual({
      allOf: [
        {
          type: "string",
          minLength: 1,
        },
        {
          type: "string",
          maxLength: 3,
        },
      ],
      unevaluatedProperties: false,
    });
  });

  it("should be possible to deref intersections", () => {
    const schema = z.string();
    const intersection = z.intersection(schema, schema);
    const jsonSchema = parseIntersectionDef(intersection._def, getRefs());

    expect(jsonSchema).toStrictEqual({
      allOf: [
        {
          type: "string",
        },
        {
          $ref: "#/allOf/0",
        },
      ],
      unevaluatedProperties: false,
    });
  });

  it("should intersect complex objects correctly", () => {
    const schema1 = z.object({
      foo: z.string()
    });
    const schema2 = z.object({
      bar: z.string()
    });
    const intersection = z.intersection(schema1, schema2);
    const jsonSchema = parseIntersectionDef(intersection._def, getRefs());

    expect(jsonSchema).toStrictEqual({
      allOf: [
        {
          properties: {
            foo: {
              type: "string"
            }
          },
          required: ["foo"],
          type: "object"
        },
        {
          properties: {
            bar: {
              type: "string"
            }
          },
          required: ["bar"],
          type: "object"
        }
      ],
      unevaluatedProperties: false,
    });
  });
});
