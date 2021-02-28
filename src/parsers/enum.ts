import { ZodEnumDef } from 'zod/lib/src/types/enum';
import { JsonSchema } from '../JsonSchema';

export function parseEnumDef(def: ZodEnumDef): JsonSchema {
  return {
    type: 'string',
    enum: def.values,
  };
}
