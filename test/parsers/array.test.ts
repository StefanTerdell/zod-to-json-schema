import { JSONSchema7Type } from 'json-schema'
import { z } from 'zod'
import { parseArrayDef, parseNonEmptyArrayDef } from '../../src/parsers/array'

describe('Arrays and array validations', () => {
  it('should be possible to describe a simple array', () => {
    const parsedSchema = parseArrayDef(z.array(z.any())._def, [], [])
    const jsonSchema: JSONSchema7Type = {
      type: 'array',
      items: {},
    }
    expect(parsedSchema).toStrictEqual(jsonSchema)
  })
  it('should be possible to describe a string array with a minimum and maximum length', () => {
    const parsedSchema = parseArrayDef(z.array(z.string()).min(2).max(4)._def, [], [])
    const jsonSchema: JSONSchema7Type = {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 2,
      maxItems: 4,
    }
    expect(parsedSchema).toStrictEqual(jsonSchema)
  })
  it('should be possible to describe a string array with a minimum length of 1 by using nonempty', () => {
    const parsedSchema = parseNonEmptyArrayDef(z.array(z.any()).nonempty()._def, [], [])
    const jsonSchema: JSONSchema7Type = {
      type: 'array',
      items: {},
      minItems: 1,
    }
    expect(parsedSchema).toStrictEqual(jsonSchema)
  })
})
