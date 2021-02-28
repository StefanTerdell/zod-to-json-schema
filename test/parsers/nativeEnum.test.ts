import { JSONSchema7Type } from 'json-schema';
import * as z from 'zod';
import { parseNativeEnumDef } from '../../src/parsers/nativeEnum';

describe('Native enums', () => {
  it('should be possible to convert a basic native number enum', () => {
    enum MyEnum {
      val1,
      val2,
      val3,
    }

    const parsedSchema = parseNativeEnumDef(z.nativeEnum(MyEnum)._def);
    const jsonSchema: JSONSchema7Type = {
      type: 'number',
      enum: [0, 1, 2],
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });

  it('should be possible to convert a native string enum', () => {
    enum MyEnum {
      val1 = 'a',
      val2 = 'b',
      val3 = 'c',
    }

    const parsedSchema = parseNativeEnumDef(z.nativeEnum(MyEnum)._def);
    const jsonSchema: JSONSchema7Type = {
      type: 'string',
      enum: ['a', 'b', 'c'],
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });

  it('should be possible to convert a mixed value native enum', () => {
    enum MyEnum {
      val1 = 'a',
      val2 = 1,
      val3 = 'c',
    }

    const parsedSchema = parseNativeEnumDef(z.nativeEnum(MyEnum)._def);
    const jsonSchema: JSONSchema7Type = {
      type: ['string', 'number'],
      enum: ['a', 1, 'c'],
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});
