import { ZodObjectDef, ZodTypeDef } from 'zod'
import { JsonSchema7Type, parseDef } from '../parseDef'

export type JsonSchema7ObjectType = {
  type: 'object'
  properties: Record<string, JsonSchema7Type>
  additionalProperties: boolean
  required?: string[]
}

export function parseObjectDef(def: ZodObjectDef, path: string[], visited: { def: ZodTypeDef; path: string[] }[]) {

  const entries = Object.entries(def.shape())
    .filter(([, value]) => value !== undefined && value._def !== undefined)

  const result: JsonSchema7ObjectType =
  {
    type: 'object',
    properties: entries
      .map(([key, value]) => ({ key, value: parseDef(value, [...path, 'properties', key], visited) }))
      .filter(({ value }) => value !== undefined)
      .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {}),
    additionalProperties: false
  }
  const required = Object.entries(def.shape())
    .filter(([, value]) => value !== undefined && value._def !== undefined)
    .filter(
      ([key, value]) =>
        Object.keys(result.properties).includes(key) &&
        value._def.t !== 'undefined' &&
        (value._def.t !== 'union' || !value._def.options.find((x: any) => x._def.t === 'undefined'))
    )
    .map(([key]) => key)
  if (required.length) {
    result.required = required
  }
  return result
}
