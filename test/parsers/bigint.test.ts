import { JSONSchema7Type } from "json-schema";
import { parseBigintDef } from "../../src/parsers/bigint";
import { z } from "zod";
import { getRefs } from "../../src/Refs";

describe("bigint", () => {
  it("should be possible to use bigint", () => {
    const parsedSchema = parseBigintDef(z.bigint()._def, getRefs());
    const jsonSchema: JSONSchema7Type = {
      type: "integer",
      format: "int64",
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });

  // Jest doesn't like bigints. 🤷
  it.skip("should be possible to define gt/lt", () => {
    const parsedSchema = parseBigintDef(
      z.bigint().gt(BigInt(10)).lt(BigInt(20))._def,
      getRefs()
    );
    const jsonSchema = {
      type: "integer",
      format: "int64",
      minimum: BigInt(10),
      maximum: BigInt(20),
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});
