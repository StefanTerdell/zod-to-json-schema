import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { parseNumberDef } from "../../src/parsers/number";
import { References } from "../../src/References";
describe("Number validations", () => {
  it("should be possible to describe minimum number", () => {
    const parsedSchema = parseNumberDef(
      z.number().min(5)._def,
      new References()
    );
    const jsonSchema: JSONSchema7Type = {
      type: "number",
      minimum: 5,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it("should be possible to describe maximum number", () => {
    const parsedSchema = parseNumberDef(
      z.number().max(5)._def,
      new References()
    );
    const jsonSchema: JSONSchema7Type = {
      type: "number",
      maximum: 5,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it("should be possible to describe both minimum and maximum number", () => {
    const parsedSchema = parseNumberDef(
      z.number().min(5).max(5)._def,
      new References()
    );
    const jsonSchema: JSONSchema7Type = {
      type: "number",
      minimum: 5,
      maximum: 5,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it("should be possible to describe an integer", () => {
    const parsedSchema = parseNumberDef(
      z.number().int()._def,
      new References()
    );
    const jsonSchema: JSONSchema7Type = {
      type: "integer",
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it("should be possible to describe multiples of n", () => {
    const parsedSchema = parseNumberDef(
      z.number().multipleOf(2)._def,
      new References()
    );
    const jsonSchema: JSONSchema7Type = {
      type: "number",
      multipleOf: 2,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it("should be possible to describe positive, negative, nonpositive and nonnegative numbers", () => {
    const parsedSchema = parseNumberDef(
      z.number().positive().negative().nonpositive().nonnegative()._def,
      new References()
    );
    const jsonSchema: JSONSchema7Type = {
      type: "number",
      minimum: 0,
      maximum: 0,
      exclusiveMaximum: 0,
      exclusiveMinimum: 0,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});
