import { ZodNumberDef } from 'zod/lib/src/types/number';

export type JsonSchema7NumberType = {
  type: 'number' | 'integer';
  minimum?: number;
  exclusiveMinimum?: number;
  maximum?: number;
  exclusiveMaximum?: number;
};

export function parseNumberDef(def: ZodNumberDef): JsonSchema7NumberType {
  const res: JsonSchema7NumberType = {
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
