import { JsonSchema } from '../JsonSchema';

export function parseDateDef(): JsonSchema {
  return {
    type: 'string',
    format: 'date-time',
  };
}
