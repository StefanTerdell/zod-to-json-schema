import { z } from "zod";
import { parseTupleDef } from "../../src/parsers/tuple";
import { getRefs } from "../../src/Refs"

describe("objects", () => {
  it("should be possible to describe a simple tuple schema", () => {
    const schema = z.tuple([z.string(), z.number()]);

    const parsedSchema = parseTupleDef(schema._def, getRefs());
    const expectedSchema = {
      type: "array",
      items: [{ type: "string" }, { type: "number" }],
      minItems: 2,
      maxItems: 2,
    };
    expect(parsedSchema).toStrictEqual(expectedSchema);
  });

  it("should be possible to describe a tuple schema with rest()", () => {
    const schema = z.tuple([z.string(), z.number()]).rest(z.boolean());

    const parsedSchema = parseTupleDef(schema._def, getRefs());
    const expectedSchema = {
      type: "array",
      items: [{ type: "string" }, { type: "number" }],
      minItems: 2,
      additionalItems: {
        type: "boolean",
      },
    };
    expect(parsedSchema).toStrictEqual(expectedSchema);
  });
});
