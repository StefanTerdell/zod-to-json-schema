import { JSONSchema7Type } from "json-schema";
import { z } from "zod";
import { JsonSchema7Type } from "../../src/parseDef";
import { parseStringDef } from "../../src/parsers/string";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = addFormats(new Ajv());

describe("String validations", () => {
  it("should be possible to describe minimum length of a string", () => {
    const parsedSchema = parseStringDef(z.string().min(5)._def);
    const jsonSchema: JSONSchema7Type = {
      type: "string",
      minLength: 5,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);

    ajv.validate(parsedSchema, "1234");
    expect(ajv.errors).toStrictEqual([
      {
        keyword: "minLength",
        instancePath: "",
        schemaPath: "#/minLength",
        params: { limit: 5 },
        message: "must NOT have fewer than 5 characters",
      },
    ]);
  });
  it("should be possible to describe maximum length of a string", () => {
    const parsedSchema = parseStringDef(z.string().max(5)._def);
    const jsonSchema: JSONSchema7Type = {
      type: "string",
      maxLength: 5,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
    ajv.validate(parsedSchema, "123456");
    expect(ajv.errors).toStrictEqual([
      {
        keyword: "maxLength",
        instancePath: "",
        schemaPath: "#/maxLength",
        params: { limit: 5 },
        message: "must NOT have more than 5 characters",
      },
    ]);
  });
  it("should be possible to describe both minimum and maximum length of a string", () => {
    const parsedSchema = parseStringDef(z.string().min(5).max(5)._def);
    const jsonSchema: JSONSchema7Type = {
      type: "string",
      minLength: 5,
      maxLength: 5,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it("should be possible to use email constraint", () => {
    const parsedSchema = parseStringDef(z.string().email()._def);
    const jsonSchema: JsonSchema7Type = {
      type: "string",
      format: "email",
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
    ajv.validate(parsedSchema, "herpderp");
    expect(ajv.errors).toStrictEqual([
      {
        instancePath: "",
        schemaPath: "#/format",
        keyword: "format",
        params: { format: "email" },
        message: 'must match format "email"',
      },
    ]);
    expect(ajv.validate(parsedSchema, "hej@hej.com")).toEqual(true);
  });
  it("should be possible to use uuid constraint", () => {
    const parsedSchema = parseStringDef(z.string().uuid()._def);
    const jsonSchema: JsonSchema7Type = {
      type: "string",
      format: "uuid",
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
    ajv.validate(parsedSchema, "herpderp");
    expect(ajv.errors).toStrictEqual([
      {
        instancePath: "",
        schemaPath: "#/format",
        keyword: "format",
        params: { format: "uuid" },
        message: 'must match format "uuid"',
      },
    ]);
    expect(
      ajv.validate(parsedSchema, "2ad7b2ce-e571-44b8-bee3-84fb3ac80d6b")
    ).toEqual(true);
  });
  it("should be possible to use url constraint", () => {
    const parsedSchema = parseStringDef(z.string().url()._def);
    const jsonSchema: JsonSchema7Type = {
      type: "string",
      format: "uri",
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
    ajv.validate(parsedSchema, "herpderp");
    expect(ajv.errors).toStrictEqual([
      {
        instancePath: "",
        schemaPath: "#/format",
        keyword: "format",
        params: { format: "uri" },
        message: 'must match format "uri"',
      },
    ]);
    expect(ajv.validate(parsedSchema, "http://hello.com")).toEqual(true);
  });

  it("should be possible to use regex constraint", () => {
    const parsedSchema = parseStringDef(z.string().regex(/[A-C]/)._def);
    const jsonSchema: JsonSchema7Type = {
      type: "string",
      pattern: "[A-C]",
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
    ajv.validate(parsedSchema, "herpderp");
    expect(ajv.errors).toStrictEqual([
      {
        instancePath: "",
        schemaPath: "#/pattern",
        keyword: "pattern",
        params: { pattern: "[A-C]" },
        message: 'must match pattern "[A-C]"',
      },
    ]);
    expect(ajv.validate(parsedSchema, "B")).toEqual(true);
  });

  it("should be possible to use CUID constraint", () => {
    const parsedSchema = parseStringDef(z.string().cuid()._def);
    const jsonSchema: JsonSchema7Type = {
      type: "string",
      pattern: "^c[^\\s-]{8,}$",
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
    ajv.validate(parsedSchema, "herpderp");
    expect(ajv.errors).toStrictEqual([
      {
        instancePath: "",
        schemaPath: "#/pattern",
        keyword: "pattern",
        params: { pattern: "^c[^\\s-]{8,}$" },
        message: 'must match pattern "^c[^\\s-]{8,}$"',
      },
    ]);
    expect(ajv.validate(parsedSchema, "ckopqwooh000001la8mbi2im9")).toEqual(
      true
    );
  });

  it('should gracefully ignore the .trim() "check"', () => {
    const parsedSchema = parseStringDef(z.string().trim()._def);
    const jsonSchema = { type: "string" };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});
