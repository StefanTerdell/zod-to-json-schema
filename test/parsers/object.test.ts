import { z } from "zod";
import { parseObjectDef } from "../../src/parsers/object";

describe("objects", () => {
  it("should be possible to describe catchAll schema", () => {
    const schema = z
      .object({ normalProperty: z.string() })
      .catchall(z.boolean());

    const parsedSchema = parseObjectDef(schema._def, [], []);
    const expectedSchema = {
      type: "object",
      properties: {
        normalProperty: { type: "string" },
      },
      required: ["normalProperty"],
      additionalProperties: {
        type: "boolean",
      },
    };
    expect(parsedSchema).toStrictEqual(expectedSchema);
  });
});
