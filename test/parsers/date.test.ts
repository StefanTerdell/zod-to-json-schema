import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parseDateDef } from "../../src/parsers/date";
import { getRefs } from "../../src/Refs";
import { errorReferences } from "./errorReferences";
describe("Number validations", () => {
  it("should be possible to describe minimum number", () => {
    const zodDateSchema = z.date().min(new Date("1970-01-02"), { message: "Too old" })
    const parsedSchema = parseDateDef(zodDateSchema._def, getRefs());

    console.log(parsedSchema);

    // const jsonSchema: JSONSchema7Type = {
    //   type: "number",
    //   minimum: 5,
    // };
    // expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});
