import { ZodLiteralDef } from 'zod';
import { Refs } from '../Refs.js';
import { SchemaTargets } from '../Options.js';

export type JsonSchema7LiteralType =
  | {
      type: 'string' | 'number' | 'integer' | 'boolean';
      const: string | number | boolean;
    }
  | {
      type: 'object' | 'array';
    };

export function parseLiteralDef(def: ZodLiteralDef, refs: Refs): JsonSchema7LiteralType {
  const parsedType = typeof def.value;
  if (
    parsedType !== 'bigint' &&
    parsedType !== 'number' &&
    parsedType !== 'boolean' &&
    parsedType !== 'string'
  ) {
    return {
      type: Array.isArray(def.value) ? 'array' : 'object',
    };
  }

  switch (refs.target) {
    case SchemaTargets.OPENAPI_3:
      return {
        type: parsedType === 'bigint' ? 'integer' : parsedType,
        enum: [def.value],
      } as any;

    case SchemaTargets.MONGODB:
      return {
        bsonType: parsedType === 'bigint' ? 'int' : parsedType,
        enum: [def.value],
      } as any;
    default:
      return {
        type: parsedType === 'bigint' ? 'integer' : parsedType,
        const: def.value,
      };
  }
}
