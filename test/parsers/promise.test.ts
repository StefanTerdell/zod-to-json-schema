import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parsePromiseDef } from "../../src/parsers/promise";
import { getRefs } from "../../src/Refs";

describe("promise", () => {
  it("should be possible to use promise", () => {
    const parsedSchema = parsePromiseDef(z.promise(z.string())._def, getRefs());
    const jsonSchema: JSONSchema7Type = {
      type: "string",
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});
