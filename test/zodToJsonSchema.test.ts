import {z} from 'zod';
import { zodToJsonSchema } from '../src/zodToJsonSchema';

describe('Root schema result after parsing', () => {
  it('should return the schema directly in the root if no name is passed', () => {
    expect(zodToJsonSchema(z.any())).toStrictEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
    });
  });
  it('should return the schema inside a named property in "definitions" if a name is passed', () => {
    expect(zodToJsonSchema(z.any(), 'MySchema')).toStrictEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: `#/definitions/MySchema`,
      definitions: {
        MySchema: {},
      },
    });
  });
});
