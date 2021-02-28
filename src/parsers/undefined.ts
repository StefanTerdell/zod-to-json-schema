import { JsonSchema } from '../JsonSchema';

export function getUndefined(): JsonSchema {
  return {
    not: {},
  };
}
