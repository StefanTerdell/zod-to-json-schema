export type Serializable =
  | { [key: string]: Serializable }
  | Serializable[]
  | string
  | number
  | boolean
  | null

export type JsonSchema = JsonSchemaObject | boolean
export type JsonSchemaObject = {
  // left permissive by design
  type?: string | string[]

  // object
  properties?: { [key: string]: JsonSchema }
  additionalProperties?: JsonSchema
  unevaluatedProperties?: JsonSchema
  patternProperties?: { [key: string]: JsonSchema }
  minProperties?: number
  maxProperties?: number
  required?: string[] | boolean
  propertyNames?: JsonSchema

  // array
  items?: JsonSchema | JsonSchema[]
  additionalItems?: JsonSchema
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean

  // string
  minLength?: number
  maxLength?: number
  pattern?: string
  format?: string

  // number
  minimum?: number | BigInt
  maximum?: number | BigInt
  exclusiveMinimum?: number | BigInt | boolean
  exclusiveMaximum?: number | BigInt | boolean
  multipleOf?: number | BigInt

  // unions
  anyOf?: JsonSchema[]
  allOf?: JsonSchema[]
  oneOf?: JsonSchema[]

  if?: JsonSchema
  then?: JsonSchema
  else?: JsonSchema
  not?: JsonSchema

  $ref?: string
  $defs?: { [key: string]: JsonSchema }
  definitions?: { [key: string]: JsonSchema }

  description?: string
  title?: string

  // shared
  const?: Serializable
  enum?: Serializable[]

  errorMessage?: { [key: string]: string | undefined }
} & { [key: string]: any }
