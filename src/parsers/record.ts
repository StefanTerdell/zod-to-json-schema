import { ZodRecordDef, ZodTypeDef } from 'zod';

import { JsonSchema7Type, parseDef } from '../parseDef';

export type JsonSchema7RecordType = {
  type: 'object';
  additionalProperties: JsonSchema7Type;
};

export function parseRecordDef(def: ZodRecordDef, path: string[], visited: { def: ZodTypeDef; path: string[] }[]): JsonSchema7RecordType {
  return {
    type: 'object',
    additionalProperties: parseDef(def.valueType._def, [...path, 'additionalProperties'], visited) || {},
  };
}
