import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parseNullableDef } from "../../src/parsers/nullable";
import { parseObjectDef } from "../../src/parsers/object";
import { References } from "../../src/References";

describe("nullable", () => {
  it("should be possible to properly reference nested nullable primitives", () => {
    const nullablePrimitive = z.string().nullable();

    const schema = z.object({
      one: nullablePrimitive,
      two: nullablePrimitive,
    });

    const jsonSchema: any = parseObjectDef(schema._def, new References());

    expect(jsonSchema.properties.one.type).toStrictEqual(["string", "null"]);
    expect(jsonSchema.properties.two.$ref).toStrictEqual("#/properties/one");
  });

  it("should be possible to properly reference nested nullable primitives", () => {
    const three = z.string();

    const nullableObject = z
      .object({
        three,
      })
      .nullable();

    const schema = z.object({
      one: nullableObject,
      two: nullableObject,
      three,
    });

    const jsonSchema: any = parseObjectDef(schema._def, new References());

    expect(jsonSchema.properties.one).toStrictEqual({
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["three"],
          properties: {
            three: {
              type: "string",
            },
          },
        },
        {
          type: "null",
        },
      ],
    });
    expect(jsonSchema.properties.two.$ref).toStrictEqual("#/properties/one");
    expect(jsonSchema.properties.three.$ref).toStrictEqual(
      "#/properties/one/anyOf/0/properties/three"
    );
  });
});
