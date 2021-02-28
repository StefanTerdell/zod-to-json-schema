import { JsonSchema } from '../../src/JsonSchema';
import { getArray } from '../../src/parsers/array';
import * as z from 'zod';

describe('Arrays and array validations', () => {
  it('should be possible to describe a simple array', () => {
    const parsedSchema = getArray(z.array(z.any())._def, [], []);
    const jsonSchema: JsonSchema = {
      type: 'array',
      items: {},
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it('should be possible to describe a string array with a minimum and maximum length', () => {
    const parsedSchema = getArray(z.array(z.string()).min(2).max(4)._def, [], []);
    const jsonSchema: JsonSchema = {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 2,
      maxItems: 4,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it('should be possible to describe a string array with a minimum length of 1 by using nonempty', () => {
    const parsedSchema = getArray(z.array(z.any()).nonempty()._def, [], []);
    const jsonSchema: JsonSchema = {
      type: 'array',
      items: {},
      minItems: 1,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});
