import { ZodTypeDef } from 'zod';

import { ZodTupleDef } from 'zod/lib/src/types/tuple';
import { JsonSchema } from '../JsonSchema';
import { parseDef } from '../parseDef';

export function getTuple(def: ZodTupleDef, path: string[], visited: { def: ZodTypeDef; path: string[] }[]): JsonSchema {
  return {
    type: 'array',
    minItems: def.items.length,
    maxItems: def.items.length,
    items: def.items.map((x, i) => parseDef(x._def, [...path, 'items', i.toString()], visited)),
  };
}
