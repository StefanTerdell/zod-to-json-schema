import { z } from "zod";
import { parseObjectDef } from "../../src/parsers/object.js";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";

suite("objects", (test) => {
  test("should be possible to describe catchAll schema", (assert) => {
    const schema = z
      .object({ normalProperty: z.string() })
      .catchall(z.boolean());

    const parsedSchema = parseObjectDef(schema._def, getRefs());
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
    assert(parsedSchema, expectedSchema);
  });

  test("should be possible to use selective partial", (assert) => {
    const schema = z
      .object({ foo: z.boolean(), bar: z.number() })
      .partial({ foo: true });

    const parsedSchema = parseObjectDef(schema._def, getRefs());
    const expectedSchema = {
      type: "object",
      properties: {
        foo: { type: "boolean" },
        bar: { type: "number" },
      },
      required: ["bar"],
      additionalProperties: false,
    };
    assert(parsedSchema, expectedSchema);
  });
});
