import * as z from 'zod';
import { JsonSchema } from '../../src/JsonSchema';
import { parseBigintDef } from '../../src/parsers/bigint';

describe('bigint', () => {
  it('should be possible to use bigint', () => {
    const parsedSchema = parseBigintDef(z.bigint()._def);
    const jsonSchema: JsonSchema = {
      type: 'integer',
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});
