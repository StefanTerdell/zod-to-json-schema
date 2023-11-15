import { z } from "zod"
import { parsePipelineDef } from "../../src/parsers/pipeline"
import { getRefs } from "../../src/Refs"
import { suite } from "../suite"

suite("pipe", (test) => {
  test("Should create an allOf schema with all its inner schemas represented", (assert) => {
    const schema = z.number().pipe(z.number().int())

    assert(parsePipelineDef(schema._def, getRefs()), {
      allOf: [{ type: "number" }, { type: "integer" }],
    })
  })

  test("Should parse the input schema if that strategy is selected", (assert) => {
    const schema = z.number().pipe(z.number().int())

    assert(parsePipelineDef(schema._def, getRefs({ pipeStrategy: "input" })), {
      type: "number",
    })
  })
})
