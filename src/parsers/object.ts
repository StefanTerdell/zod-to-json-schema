import { ZodTypeDef } from 'zod';

import { ZodObjectDef } from 'zod/lib/src/types/object';
import { JsonSchema } from '../JsonSchema';
import { parseDef } from '../parseDef';

export function getObject(def: ZodObjectDef, path: string[], visited: { def: ZodTypeDef; path: string[] }[]) {
  const result: JsonSchema = {
    type: 'object',
    properties: Object.entries(def.shape())
      .map(([key, value]) => ({ key, value: parseDef(value._def, [...path, 'properties', key], visited) }))
      .filter(({ value }) => value !== undefined)
      .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {}),
    additionalProperties: !def.params.strict,
  };
  const required = Object.entries(def.shape())
    .filter(
      ([key, value]) =>
        Object.keys(result.properties).includes(key) &&
        value._def.t !== 'undefined' &&
        (value._def.t !== 'union' || !value._def.options.find((x) => x._def.t === 'undefined'))
    )
    .map(([key]) => key);
  if (required.length) {
    result.required = required;
  }
  return result;
}
