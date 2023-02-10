import { JSONSchema7Type } from "json-schema";
import { parseBigintDef } from "../../src/parsers/bigint";

describe("bigint", () => {
  it("should be possible to use bigint", () => {
    const parsedSchema = parseBigintDef();
    const jsonSchema: JSONSchema7Type = {
      type: "integer",
      format: "int64",
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});
