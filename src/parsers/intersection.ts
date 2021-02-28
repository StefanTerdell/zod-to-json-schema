import { ZodTypeDef, ZodTypes } from 'zod';
import { ZodIntersectionDef } from 'zod/lib/src/types/intersection';
import { JsonSchema7Type, parseDef } from '../parseDef';
import { parseObjectDef } from './object';

export function parseIntersectionDef(def: ZodIntersectionDef, path: string[], visited: { def: ZodTypeDef; path: string[] }[]): JsonSchema7Type {
  const rightDef = def.right._def;
  if (rightDef.t === ZodTypes.object) {
    const right = parseObjectDef(rightDef, path, visited);
    const leftDef = def.left._def;
    if (leftDef.t === ZodTypes.object) {
      const left = parseObjectDef(leftDef, path, visited);
      return {
        type: 'object',
        properties: { ...left.properties, ...right.properties },
        required: [...(left.required || []).filter((x) => !Object.keys(right.properties).includes(x)), ...(right.required || [])],
      };
    }
    return right;
  }
  return parseDef(rightDef, path, visited);
}
