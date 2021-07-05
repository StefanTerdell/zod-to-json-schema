import { JSONSchema7Type } from 'json-schema';
import { z } from 'zod';
import { parseStringDef } from '../../src/parsers/string';

describe('String validations', () => {
  it('should be possible to describe minimum length of a string', () => {
    const parsedSchema = parseStringDef(z.string().min(5)._def);
    const jsonSchema: JSONSchema7Type = {
      type: 'string',
      minLength: 5,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it('should be possible to describe maximum length of a string', () => {
    const parsedSchema = parseStringDef(z.string().max(5)._def);
    const jsonSchema: JSONSchema7Type = {
      type: 'string',
      maxLength: 5,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it('should be possible to describe both minimum and maximum length of a string', () => {
    const parsedSchema = parseStringDef(z.string().min(5).max(5)._def);
    const jsonSchema: JSONSchema7Type = {
      type: 'string',
      minLength: 5,
      maxLength: 5,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});
