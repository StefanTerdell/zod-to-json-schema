import * as z from 'zod';
import { JSONSchema7 } from 'json-schema';
import { toJsonSchema } from '.';
import Ajv from 'ajv';

describe('Parsing a given object', () => {
  it('should return a proper json schema with some common types without validation', () => {
    const zodSchema = z.object({
      requiredString: z.string(),
      optionalString: z.string().optional(),
      literalString: z.literal('literalStringValue'),
      stringArray: z.array(z.string()),
      stringEnum: z.enum(['stringEnumOptionA', 'stringEnumOptionB']),
      tuple: z.tuple([z.string(), z.number(), z.boolean()]),
      record: z.record(z.boolean()),
      requiredNumber: z.number(),
      optionalNumber: z.number().optional(),
      numberOrNull: z.number().nullable(),
      numberUnion: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      mixedUnion: z.union([z.literal('abc'), z.literal(123), z.object({ nowItGetsAnnoying: z.literal(true) })]),
    });
    const expectedJsonSchema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: '#/definitions/zodSchema',
      definitions: {
        zodSchema: {
          type: 'object',
          properties: {
            requiredString: {
              type: 'string',
            },
            optionalString: {
              type: 'string',
            },
            literalString: {
              type: 'string',
              const: 'literalStringValue',
            },
            stringArray: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            stringEnum: {
              type: 'string',
              enum: ['stringEnumOptionA', 'stringEnumOptionB'],
            },
            tuple: {
              type: 'array',
              minItems: 3,
              items: [
                {
                  type: 'string',
                },
                {
                  type: 'number',
                },
                {
                  type: 'boolean',
                },
              ],
              maxItems: 3,
            },
            record: {
              type: 'object',
              additionalProperties: {
                type: 'boolean',
              },
            },
            requiredNumber: {
              type: 'number',
            },
            optionalNumber: {
              type: 'number',
            },
            numberOrNull: {
              type: ['number', 'null'],
            },
            numberUnion: {
              type: 'number',
              enum: [1, 2, 3],
            },
            mixedUnion: {
              anyOf: [
                {
                  type: 'string',
                  const: 'abc',
                },
                {
                  type: 'number',
                  const: 123,
                },
                {
                  type: 'object',
                  properties: {
                    nowItGetsAnnoying: {
                      type: 'boolean',
                      const: true,
                    },
                  },
                  required: ['nowItGetsAnnoying'],
                  additionalProperties: false,
                },
              ],
            },
          },
          required: [
            'requiredString',
            'literalString',
            'stringArray',
            'stringEnum',
            'tuple',
            'record',
            'requiredNumber',
            'numberOrNull',
            'numberUnion',
            'mixedUnion',
          ],
          additionalProperties: false,
        },
      },
    };
    const parsedSchema = toJsonSchema(zodSchema, 'zodSchema');
    expect(parsedSchema).toStrictEqual(expectedJsonSchema);
  });
  it('should handle recurring properties with paths', () => {
    const addressSchema = z.object({ street: z.string(), number: z.number(), city: z.string() });
    const someAddresses = z.object({
      address1: addressSchema,
      address2: addressSchema,
      lotsOfAddresses: z.array(addressSchema),
    });
    const jsonSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',

      type: 'object',
      properties: {
        address1: {
          type: 'object',
          properties: { street: { type: 'string' }, number: { type: 'number' }, city: { type: 'string' } },
          additionalProperties: false,
          required: ['street', 'number', 'city'],
        },
        address2: { $ref: '#/properties/address1' },
        lotsOfAddresses: { type: 'array', items: { $ref: '#/properties/address1' } },
      },
      additionalProperties: false,
      required: ['address1', 'address2', 'lotsOfAddresses'],
    };
    const parsedSchema = toJsonSchema(someAddresses);
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});

describe('String validations', () => {
  it('should be possible to describe minimum length of a string', () => {
    const parsedSchema = toJsonSchema(z.string().min(5));
    const jsonSchema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'string',
      minLength: 5,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it('should be possible to describe maximum length of a string', () => {
    const parsedSchema = toJsonSchema(z.string().max(5));
    const jsonSchema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'string',
      maxLength: 5,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it('should be possible to describe both minimum and maximum length of a string', () => {
    const parsedSchema = toJsonSchema(z.string().min(5).max(5));
    const jsonSchema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'string',
      minLength: 5,
      maxLength: 5,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});

describe('Number validations', () => {
  it('should be possible to describe minimum number', () => {
    const parsedSchema = toJsonSchema(z.number().min(5));
    const jsonSchema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'number',
      minimum: 5,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it('should be possible to describe maximum number', () => {
    const parsedSchema = toJsonSchema(z.number().max(5));
    const jsonSchema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'number',
      maximum: 5,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it('should be possible to describe both minimum and maximum number', () => {
    const parsedSchema = toJsonSchema(z.number().min(5).max(5));
    const jsonSchema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'number',
      minimum: 5,
      maximum: 5,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it('should be possible to describe an integer', () => {
    const parsedSchema = toJsonSchema(z.number().int());
    const jsonSchema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'integer',
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it('should be possible to describe positive, negative, nonpositive and nonnegative numbers', () => {
    const parsedSchema = toJsonSchema(z.number().positive().negative().nonpositive().nonnegative());
    const jsonSchema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'number',
      minimum: 0,
      maximum: 0,
      exclusiveMaximum: 0,
      exclusiveMinimum: 0,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it('should be possible to use bigint', () => {
    const parsedSchema = toJsonSchema(z.bigint());
    const jsonSchema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'integer',
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});

describe('Arrays and array validations', () => {
  it('should be possible to describe a simple array', () => {
    const parsedSchema = toJsonSchema(z.array(z.any()));
    const jsonSchema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'array',
      items: {},
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
  it('should be possible to describe a string array with a minimum and maximum length', () => {
    const parsedSchema = toJsonSchema(z.array(z.string()).min(2).max(4));
    const jsonSchema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
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
    const parsedSchema = toJsonSchema(z.array(z.any()).nonempty());
    const jsonSchema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'array',
      items: {},
      minItems: 1,
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });
});

describe('Unions', () => {
  it('Should be possible to get a simple type array from a union of only unvalidated primitives', () => {
    const parsedSchema = toJsonSchema(z.union([z.string(), z.number(), z.boolean(), z.null()]));
    const jsonSchema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: ['string', 'number', 'boolean', 'null'],
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });

  it('Should be possible to get a simple type array with enum values from a union of literals', () => {
    const parsedSchema = toJsonSchema(z.union([z.literal('string'), z.literal(123), z.literal(true), z.literal(null)]));
    const jsonSchema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: ['string', 'number', 'boolean', 'null'],
      enum: ['string', 123, true, null],
    };
    expect(parsedSchema).toStrictEqual(jsonSchema);
  });

  it('Should be possible to create a union with objects, arrays and validated primitives as an anyOf', () => {
    const parsedSchema = toJsonSchema(z.union([z.object({ herp: z.string(), derp: z.boolean() }), z.array(z.number()), z.string().min(3), z.number()]));
    const jsonSchema: JSONSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
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

describe('Output validation', () => {
  it('String errors should match between Z and Ajv', () => {
    const zodSchema = z.string().min(2).max(4);
    const jsonSchema = toJsonSchema(zodSchema);

    const tooShort: z.infer<typeof zodSchema> = '-';

    const zodErrors = zodSchema.safeParse(tooShort);

    const validate = new Ajv().compile(jsonSchema);
    validate(tooShort);
    const ajvErrors = validate.errors;
  });
});
