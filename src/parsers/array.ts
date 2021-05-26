import { ZodArrayDef, ZodNonEmptyArrayDef, ZodTypeDef } from 'zod';
// import { ZodArrayDef } from 'zod/lib/src/types/array';
import { JsonSchema7Type, parseDef } from '../parseDef';

export type JsonSchema7ArrayType = {
  type: 'array';
  items?: JsonSchema7Type;
  minItems?: number;
  maxItems?: number;
};

export function parseArrayDef(def: ZodArrayDef|ZodNonEmptyArrayDef, path: string[], visited: { def: ZodTypeDef; path: string[] }[]) {
  {
    const res: JsonSchema7ArrayType = {
      type: 'array',
      items: parseDef(def.type._def, [...path, 'items'], visited),
    };
    
    if(def.minLength) {
      res.minItems = def.minLength.value;
    }
    if(def.maxLength) {
      res.maxItems = def.maxLength.value;
    }

    return res;
  }
}
