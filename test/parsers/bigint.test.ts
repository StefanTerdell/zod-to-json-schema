import * as z from 'zod';
import { JsonSchema } from '../../src/JsonSchema';
import { getBigint } from '../../src/parsers/bigint';

describe('bigint', () => {
  it('should be possible to use bigint', () => {
    const parsedSchema = getBigint(z.bigint()._def);
    const jsonSchema: JsonSchema = {
      type: 'integer',
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});
