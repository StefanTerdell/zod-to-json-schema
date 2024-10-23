import { JSONSchema7Type } from "json-schema";
import { parseReadonlyDef } from "../../src/parsers/readonly.js";
import { z } from "zod";
import { getRefs } from "../../src/Refs.js";
import { suite } from "../suite.js";
suite("readonly", (test) => {
  test("should be possible to use readonly", (assert) => {
    const parsedSchema = parseReadonlyDef(
      z.object({}).readonly()._def,
      getRefs(),
    );
    const jsonSchema: JSONSchema7Type = {
      type: "object",
      properties: {},
      additionalProperties: false,
      readOnly: true,
    };
    assert(parsedSchema, jsonSchema);
  });
  test("should be possible to use readonly on strings", (assert) => {
    const parsedSchema = parseReadonlyDef(
      z.object({ test: z.string().readonly() }).readonly()._def,
      getRefs(),
    );
    const jsonSchema: JSONSchema7Type = {
      type: "object",
      properties: { test: { type: "string", readOnly: true } },
      required: ["test"],
      additionalProperties: false,
      readOnly: true,
    };
    assert(parsedSchema, jsonSchema);
  });
});
