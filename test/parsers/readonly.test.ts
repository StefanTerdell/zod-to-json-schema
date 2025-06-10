import { parseReadonlyDef } from "../../src/parsers/readonly.js";
import { z } from "zod";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";
import { ZodJsonSchema } from "../../src/parseTypes.js";
suite("readonly", (test) => {
  test("should be possible to use readonly", (assert) => {
    const parsedSchema = parseReadonlyDef(
      z.object({}).readonly()._def,
      getRefs(),
    );

    const jsonSchema: ZodJsonSchema = {
      type: "object",
      // properties: {},
      additionalProperties: false,
    };

    assert(parsedSchema, jsonSchema);
  });
});
