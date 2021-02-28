import { JsonSchema } from '../JsonSchema';

export function getDate(): JsonSchema {
  return {
    type: 'string',
    format: 'date-time',
  };
}
