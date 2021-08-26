import { z } from "zod";
import { parseIntersectionDef } from "../../src/parsers/intersection";

describe("intersections", () => {
  it("should be possible to use intersections", () => {
    const intersection = z.intersection(z.string().min(1), z.string().max(3));

    const jsonSchema = parseIntersectionDef(intersection._def, [], []);

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
    });
  });

  it("should be possible to deref intersections", () => {
    const schema = z.string()
    const intersection = z.intersection(schema, schema)
    const jsonSchema = parseIntersectionDef(intersection._def, [], []);

    expect(jsonSchema).toStrictEqual({
      allOf: [
        {
          type: "string",
        },
        {
          $ref: "#/allOf/0"
        },
      ],
    });
  })
});
