import { ZodNativeEnumDef } from 'zod/lib/src/types/nativeEnum';
import { JsonSchema } from '../JsonSchema';

export function parseNativeEnumDef(def: ZodNativeEnumDef): JsonSchema {
  const numberValues = Object.values(def.values)
    .filter((value) => typeof value === 'number')
    .map(toString);
  const actualValues = Object.values(def.values).filter((_, i) => i >= numberValues.length);
  return {
    type: numberValues.length === 0 ? 'string' : numberValues.length === actualValues.length ? 'number' : ['string', 'number'],
    enum: actualValues,
  };
}
