import { z } from "zod";
import { parsePipelineDef } from "../../src/parsers/pipeline";
import { getRefs } from "../../src/Refs";

describe("pipe", () => {
  it("Should create an allOf schema with all its inner schemas represented", () => {
    const schema = z.number().pipe(z.number().int());

    expect(parsePipelineDef(schema._def, getRefs())).toStrictEqual({
      allOf: [{ type: "number" }, { type: "integer" }],
    });
  });

  it("Should parse the input schema if that strategy is selected", () => {
    const schema = z.number().pipe(z.number().int());

    expect(
      parsePipelineDef(schema._def, getRefs({ pipeStrategy: "input" }))
    ).toStrictEqual({
      type: "number",
    });
  });
});
