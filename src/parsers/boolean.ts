import { JsonSchema } from '../JsonSchema';

export function getBoolean(): JsonSchema {
  return {
    type: 'boolean',
  };
}
