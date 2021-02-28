import { JSONSchema7Type } from 'json-schema';
import * as z from 'zod';
import { parseBigintDef } from '../../src/parsers/bigint';

describe('bigint', () => {
  it('should be possible to use bigint', () => {
    const parsedSchema = parseBigintDef(z.bigint()._def);
    const jsonSchema: JSONSchema7Type = {
      type: 'integer',
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});
