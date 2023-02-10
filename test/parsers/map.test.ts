import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parseMapDef } from "../../src/parsers/map";
import Ajv from "ajv";
import { getRefs } from "../../src/Refs";
const ajv = new Ajv();
describe("map", () => {
  it("should be possible to use Map", () => {
    const mapSchema = z.map(z.string(), z.number());

    const parsedSchema = parseMapDef(mapSchema._def, getRefs());

    const jsonSchema: JSONSchema7Type = {
      type: "array",
      maxItems: 125,
      items: {
        type: "array",
        items: [
          {
            type: "string",
          },
          {
            type: "number",
          },
        ],
        minItems: 2,
        maxItems: 2,
      },
    };

    expect(parsedSchema).toStrictEqual(jsonSchema);

    const myMap: z.infer<typeof mapSchema> = new Map<string, number>();
    myMap.set("hello", 123);

    ajv.validate(jsonSchema, [...myMap]);
    const ajvResult = !ajv.errors;

    const zodResult = mapSchema.safeParse(myMap).success;

    expect(zodResult).toBe(true);
    expect(ajvResult).toBe(true);
  });
});
