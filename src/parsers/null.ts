import { JsonSchema } from '../JsonSchema';

export function getNull(): JsonSchema {
  return {
    type: 'null',
  };
}
