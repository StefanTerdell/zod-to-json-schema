import { ZodOptionalDef } from 'zod';
import { parseDef } from '../parseDef';

export function parseNullable(def: ZodOptionalDef): { type: string[] } {
  const type = parseDef(def.innerType, [], []);
  return {
    type: [(type as any).type, 'null'],
  };
}
