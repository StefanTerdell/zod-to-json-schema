import { ZodBigIntDef } from 'zod/lib/src/types/bigint';
import { JsonSchema7NumberType } from './number';

export type JsonSchema7BigintType = JsonSchema7NumberType & {
  type: 'integer';
};

export function parseBigintDef(def: ZodBigIntDef): JsonSchema7BigintType {
  const res: JsonSchema7BigintType = {
    type: 'integer',
  };
  if (def.checks) {
    for (const check of def.checks) {
      switch (check.code) {
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
