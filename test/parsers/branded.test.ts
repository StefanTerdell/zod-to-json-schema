import { z } from "zod";
import { parseBrandedDef } from "../../src/parsers/branded";
import { getRefs } from "../../src/Refs";

describe("objects", () => {
  it("should be possible to use branded string", () => {
    const schema = z.string().brand<"x">();
    const parsedSchema = parseBrandedDef(schema._def, getRefs());

    const expectedSchema = {
      type: "string",
    };
    expect(parsedSchema).toStrictEqual(expectedSchema);
  });
});
