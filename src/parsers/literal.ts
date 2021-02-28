import { ZodLiteralDef } from 'zod/lib/src/types/literal';
import { JsonSchema } from '../JsonSchema';

export function parseLiteralDef(def: ZodLiteralDef): JsonSchema {
  const parsedType = typeof def.value;
  if (parsedType !== 'bigint' && parsedType !== 'number' && parsedType !== 'boolean' && parsedType !== 'string') {
    return {};
  }
  return {
    type: parsedType === 'bigint' ? 'integer' : parsedType,
    const: def.value,
  };
}
