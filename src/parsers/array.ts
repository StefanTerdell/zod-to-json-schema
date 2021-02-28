import { ZodTypeDef } from 'zod';
import { ZodArrayDef } from 'zod/lib/src/types/array';
import { JsonSchema7Type, parseDef } from '../parseDef';

export type JsonSchema7ArrayType = {
  type: 'array';
  items?: JsonSchema7Type;
  minItems?: number;
  maxItems?: number;
};

export function parseArrayDef(def: ZodArrayDef, path: string[], visited: { def: ZodTypeDef; path: string[] }[]) {
  {
    const res: JsonSchema7ArrayType = {
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
