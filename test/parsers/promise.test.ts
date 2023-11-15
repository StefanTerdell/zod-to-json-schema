import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parsePromiseDef } from "../../src/parsers/promise";
import { getRefs } from "../../src/Refs";
import { suite } from "../suite";

suite("promise", (test) => {
  test("should be possible to use promise", (assert) => {
    const parsedSchema = parsePromiseDef(z.promise(z.string())._def, getRefs());
    const jsonSchema: JSONSchema7Type = {
      type: "string",
    };
    assert(parsedSchema, jsonSchema)
  });
});
