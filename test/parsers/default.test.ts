import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parseDefaultDef } from "../../src/parsers/default";

describe("promise", () => {
  it("should be possible to use default on objects", () => {
    const parsedSchema = parseDefaultDef(
      z.object({ foo: z.boolean() }).default({ foo: true })._def,
      [],
      []
    );
    const jsonSchema: JSONSchema7Type = {
      type: "object",
      additionalProperties: false,
      required: ["foo"],
      properties: {
        foo: {
          type: "boolean",
        },
      },
      default: {
        foo: true,
      },
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });

  it("should be possible to use default on primitives", () => {
    const parsedSchema = parseDefaultDef(
      z.string().default("default")._def,
      [],
      []
    );
    const jsonSchema: JSONSchema7Type = {
      type: "string",
      default: "default",
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });

  test("default with transform", () => {
    const stringWithDefault = z
      .string()
      .transform((val) => val.toUpperCase())
      .default("default");

    const parsedSchema = parseDefaultDef(stringWithDefault._def, [], []);
    const jsonSchema: JSONSchema7Type = {
      type: "string",
      default: "default",
    };

    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});
