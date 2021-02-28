import { ZodTypeDef } from 'zod';
import { ZodObjectDef } from 'zod/lib/src/types/object';
import { JsonSchema7Type, parseDef } from '../parseDef';

export type JsonSchema7ObjectType = {
  type: 'object';
  properties: Record<string, JsonSchema7Type>;
  additionalProperties: boolean;
  required?: string[];
};

export function parseObjectDef(def: ZodObjectDef, path: string[], visited: { def: ZodTypeDef; path: string[] }[]) {
  const result: JsonSchema7ObjectType = {
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
        (value._def.t !== 'union' || !value._def.options.find((x: any) => x._def.t === 'undefined'))
    )
    .map(([key]) => key);
  if (required.length) {
    result.required = required;
  }
  return result;
}
