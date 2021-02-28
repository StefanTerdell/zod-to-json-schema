import { JsonSchema } from '../JsonSchema';

export function parseNullDef(): JsonSchema {
  return {
    type: 'null',
  };
}
