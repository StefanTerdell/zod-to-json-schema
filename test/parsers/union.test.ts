import { JSONSchema7Type } from 'json-schema';
import {z} from 'zod';
import { parseUnionDef } from '../../src/parsers/union';

describe('Unions', () => {
  it('Should be possible to get a simple type array from a union of only unvalidated primitives', () => {
    const parsedSchema = parseUnionDef(z.union([z.string(), z.number(), z.boolean(), z.null()])._def, [], []);
    const jsonSchema: JSONSchema7Type = {
      type: ['string', 'number', 'boolean', 'null'],
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });

  it('Should be possible to get a simple type array with enum values from a union of literals', () => {
    const parsedSchema = parseUnionDef(z.union([z.literal('string'), z.literal(123), z.literal(true), z.literal(null)])._def, [], []);
    const jsonSchema: JSONSchema7Type = {
      type: ['string', 'number', 'boolean', 'null'],
      enum: ['string', 123, true, null],
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });

  it('Should be possible to create a union with objects, arrays and validated primitives as an anyOf', () => {
    const parsedSchema = parseUnionDef(
      z.union([z.object({ herp: z.string(), derp: z.boolean() }), z.array(z.number()), z.string().min(3), z.number()])._def,
      [],
      []
    );
    const jsonSchema: JSONSchema7Type = {
      anyOf: [
        {
          type: 'object',
          properties: {
            herp: {
              type: 'string',
            },
            derp: {
              type: 'boolean',
            },
          },
          required: ['herp', 'derp'],
          additionalProperties: false,
        },
        {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        {
          type: 'string',
          minLength: 3,
        },
        {
          type: 'number',
        },
      ],
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});
