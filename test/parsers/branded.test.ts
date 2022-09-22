import { z } from "zod";
import { parseBrandedDef } from '../../src/parsers/branded';
import { References } from "../../src/References";

describe("objects", () => {
  it("should be possible to use branded string", () => {
    const schema = z.string().brand<'x'>();
    const parsedSchema = parseBrandedDef(schema._def, new References());

    const expectedSchema = {
    type: "string"
    };
    expect(parsedSchema).toStrictEqual(expectedSchema);
  });
});
