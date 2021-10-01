import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parseEffectsDef } from "../../src/parsers/effects";
import { References } from "../../src/References";

describe("effects", () => {
  it("should be possible to use refine", () => {
    const parsedSchema = parseEffectsDef(
      z.number().refine((x) => x + 1)._def,
      new References()
    );
    const jsonSchema: JSONSchema7Type = {
      type: "number",
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });

  it("should default to the input type", () => {
    const schema = z.string().transform((arg) => parseInt(arg));

    const jsonSchema = parseEffectsDef(schema._def, new References());

    expect(jsonSchema).toStrictEqual({
      type: "string",
    });
  });

  it("should default to any if given that effectStrategy", () => {
    const schema = z.string().transform((arg) => parseInt(arg));

    const jsonSchema = parseEffectsDef(
      schema._def,
      new References(undefined, undefined, undefined, "any")
    );

    expect(jsonSchema).toStrictEqual({});
  });
});
