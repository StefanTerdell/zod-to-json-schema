import { ZodTypeDef } from 'zod';

import { ZodRecordDef } from 'zod/lib/src/types/record';
import { JsonSchema } from '../JsonSchema';
import { parseDef } from '../parseDef';

export function getRecord(def: ZodRecordDef, path: string[], visited: { def: ZodTypeDef; path: string[] }[]): JsonSchema {
  return {
    type: 'object',
    additionalProperties: parseDef(def.valueType._def, [...path, 'additionalProperties'], visited),
  };
}
