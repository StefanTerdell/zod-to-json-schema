import { JSONSchema7 } from "json-schema";
import { z } from "zod";
import { zodToJsonSchema } from "../src/zodToJsonSchema";

describe("Meta data", () => {
  it("should be possible to use description", () => {
    const $z = z.string().describe("My neat string");
    const $j = zodToJsonSchema($z);
    const $e: JSONSchema7 = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "string",
      description: "My neat string",
    };

    expect($j).toStrictEqual($e);
  });

  it("should be possible to add a markdownDescription", () => {
    const $z = z.string().describe("My neat string");
    const $j = zodToJsonSchema($z, { markdownDescription: true });
    const $e = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "string",
      description: "My neat string",
      markdownDescription: "My neat string"
    };

    expect($j).toStrictEqual($e);
  });
});
