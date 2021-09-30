import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parseArrayDef } from "../../src/parsers/array";
import { References } from "../../src/References";
const deref = require('json-schema-deref-sync')

describe("Arrays and array validations", () => {
  it("should be possible to describe a simple array", () => {
    const parsedSchema = parseArrayDef(z.array(z.any())._def, new References());
    const jsonSchema: JSONSchema7Type = {
      type: "array",
      items: {},
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it("should be possible to describe a string array with a minimum and maximum length", () => {
    const parsedSchema = parseArrayDef(
      z.array(z.string()).min(2).max(4)._def,
      new References()
    );
    const jsonSchema: JSONSchema7Type = {
      type: "array",
      items: {
        type: "string",
      },
      minItems: 2,
      maxItems: 4,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it("should be possible to describe a string array with a minimum length of 1 by using nonempty", () => {
    const parsedSchema = parseArrayDef(
      z.array(z.any()).nonempty()._def,
      new References()
    );
    const jsonSchema: JSONSchema7Type = {
      type: "array",
      items: {},
      minItems: 1,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });

  it("should be possible do properly reference array items", () => {
    const willHaveBeenSeen = z.object({ hello: z.string() });
    const unionSchema = z.union([willHaveBeenSeen, willHaveBeenSeen]);
    const arraySchema = z.array(unionSchema);
    const jsonSchema = parseArrayDef(arraySchema._def, new References());
    //TODO: Remove 'any'-cast when json schema type package supports it. 'anyOf' in 'items' should be completely according to spec though.
    expect((jsonSchema.items as any).anyOf[1].$ref).toEqual("#/items/anyOf/0");

    const resolvedSchema = deref(jsonSchema)
    expect(resolvedSchema.items.anyOf[1]).toBe(resolvedSchema.items.anyOf[0]);
  });
});
