import { ZodTypeDef } from 'zod';

import { ZodIntersectionDef } from 'zod/lib/src/types/intersection';
import { JsonSchema } from '../JsonSchema';
import { parseDef } from '../parseDef';

export function parseIntersectionDef(def: ZodIntersectionDef, path: string[], visited: { def: ZodTypeDef; path: string[] }[]): JsonSchema {
  const right = parseDef(def.right._def, path, visited);
  if (right.type === 'object' && typeof right.properties === 'object') {
    const left = parseDef(def.left._def, path, visited);
    if (left.type === 'object' && typeof left.properties === 'object') {
      return {
        type: 'object',
        properties: { ...left.properties, ...right.properties },
        required: [...(left.required || []).filter((x) => !Object.keys(right.properties).includes(x)), ...(right.required || [])],
      };
    }
  }
  return right;
}
