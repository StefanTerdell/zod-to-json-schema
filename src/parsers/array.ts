import { ZodTypeDef } from 'zod';

import { ZodArrayDef } from 'zod/lib/src/types/array';
import { parseDef } from '../parseDef';
import { JsonSchema } from '../JsonSchema';

export function parseArrayDef(def: ZodArrayDef, path: string[], visited: { def: ZodTypeDef; path: string[] }[]) {
  {
    const res: JsonSchema = {
      type: 'array',
      items: parseDef(def.type._def, [...path, 'items'], visited),
    };

    if (def.nonempty) {
      res.minItems = 1;
    }

    if (def.checks) {
      for (const check of def.checks) {
        switch (check.code) {
          case 'too_small':
            res.minItems = check.minimum;
            break;
          case 'too_big':
            res.maxItems = check.maximum;
            break;
        }
      }
    }
    return res;
  }
}
