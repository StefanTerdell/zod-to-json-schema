import { ZodTypeDef } from 'zod';
import { ZodTupleDef } from 'zod/lib/src/types/tuple';
import { JsonSchema7Type, parseDef } from '../parseDef';

export type JsonSchema7TupleType = {
  type: 'array';
  minItems: number;
  maxItems: number;
  items: JsonSchema7Type[];
};

export function parseTupleDef(def: ZodTupleDef, path: string[], visited: { def: ZodTypeDef; path: string[] }[]): JsonSchema7TupleType {
  return {
    type: 'array',
    minItems: def.items.length,
    maxItems: def.items.length,
    items: def.items
      .map((x, i) => parseDef(x._def, [...path, 'items', i.toString()], visited))
      .reduce((acc: JsonSchema7Type[], x) => (x === undefined ? acc : [...acc, x]), []),
  };
}
