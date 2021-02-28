import { ZodNumberDef } from 'zod/lib/src/types/number';
import { JsonSchema } from '../JsonSchema';

export function parseNumberDef(def: ZodNumberDef): JsonSchema {
  const res: JsonSchema = {
    type: 'number',
  };

  if (def.checks) {
    for (const check of def.checks) {
      switch (check.code) {
        case 'invalid_type':
          if (check.expected === 'integer') {
            res.type = 'integer';
          }
          break;
        case 'too_small':
          if (check.inclusive) {
            res.minimum = check.minimum;
          } else {
            res.exclusiveMinimum = check.minimum;
          }
          break;
        case 'too_big':
          if (check.inclusive) {
            res.maximum = check.maximum;
          } else {
            res.exclusiveMaximum = check.maximum;
          }
          break;
      }
    }
  }

  return res;
}
