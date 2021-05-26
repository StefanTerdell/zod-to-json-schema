import {z} from 'zod';
import zodToJsonSchema from '..';

describe('The readme example', () => {
  it('should be valid', () => {
    const mySchema = z.object({
      myString: z.string().min(5),
      myUnion: z.union([z.number(), z.boolean()]),
    });

    const jsonSchema = zodToJsonSchema(mySchema, 'mySchema');

    expect(jsonSchema).toStrictEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: '#/definitions/mySchema',
      definitions: {
        mySchema: {
          type: 'object',
          properties: {
            myString: {
              type: 'string',
              minLength: 5,
            },
            myUnion: {
              type: ['number', 'boolean'],
            },
          },
          additionalProperties: false,
          required: ['myString', 'myUnion'],
        },
      },
    });
  });
});
