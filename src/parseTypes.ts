import { ZodTypeDef } from "zod";
import { Refs } from "./Refs";

export type Json = JsonObject | JsonArray | JsonPrimitive;
export type JsonObject = { [Key in string]?: Json };
export type JsonArray = Json[];
export type JsonPrimitive = string | number | boolean | null;

export type DefParser<
  Def extends ZodTypeDef,
  AllowNull extends boolean = false,
> = (
  def: Def,
  refs: Refs,
) => ZodJsonSchema<true> | boolean | (AllowNull extends true ? null : never);

export type LiteralString<T> = T extends string
  ? "" extends T
    ? "X" extends T
      ? never
      : T
    : T
  : never;

type Enum<T extends string, Strict extends boolean> =
  LiteralString<T> extends infer U extends string
    ? Strict extends true
      ? U
      : U | (string & {})
    : never;

type ZodJsonSchemaErrorMessage<Strict extends boolean = true> = {
  [Key in Enum<keyof ZodJsonSchema, Strict>]?:
    | ZodJsonSchemaErrorMessage<false>
    | string;
};

export const isNonNullSchema = <
  Strict extends boolean,
  Schema extends ZodJsonSchema<Strict> | boolean,
>(
  schema: Schema | null,
): schema is Schema => {
  return schema !== null;
};

export const ensureObjectSchema = <
  Strict extends boolean,
  Schema extends ZodJsonSchema<Strict> | null,
>(
  schema: Schema | boolean,
): Schema => {
  if (schema === null) {
    return schema;
  }

  if (typeof schema === "boolean") {
    return (schema ? {} : { not: {} }) as Schema;
  }

  return schema;
};

export type ZodJsonSchemaType<Strict extends boolean = false> = Enum<
  "string" | "number" | "integer" | "array" | "boolean" | "object" | "null",
  Strict
>;

export type ZodJsonSchema<Strict extends boolean = any> = {
  type?: ZodJsonSchemaType<Strict> | ZodJsonSchemaType<Strict>[];

  // Strings
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: Enum<
    | "date"
    | "date-time"
    | "duration"
    | "email"
    | "hostname"
    | "idn-email"
    | "idn-hostname"
    | "ipv4"
    | "ipv6"
    | "iri"
    | "iri-reference"
    | "json-pointer"
    | "regex"
    | "relative-json-pointer"
    | "time"
    | "unix-time"
    | "uri"
    | "uri-reference"
    | "uri-template"
    | "uuid"
    | "int64",
    Strict
  >;
  contentEncoding?: Enum<
    "quoted-printable" | "base16" | "base32" | "base64",
    Strict
  >;
  contentMediaType?: string;
  contentSchema?: ZodJsonSchema<Strict>;

  // Numbers
  multipleOf?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maximum?: number;
  exclusiveMaximum?: number;

  // Objects
  required?: string[];
  properties?: Record<string, ZodJsonSchema<Strict>>;
  additionalProperties?: ZodJsonSchema<Strict> | boolean;
  // patternProperties?: Record<string, ZodJsonSchema<Strict>>,
  unevaluatedProperties?: boolean;
  propertyNames?: Omit<ZodJsonSchema<Strict>, "type">;
  minProperties?: number;
  maxProperties?: number;

  // Dependencies
  dependentRequired?: Record<string, string[]>;
  dependentSchemas?: Record<string, ZodJsonSchema<Strict>>;

  // Arrays
  prefixItems?: ZodJsonSchema<Strict>[];
  items?: ZodJsonSchema<Strict>;
  additionalItems?: ZodJsonSchema<Strict> | boolean;
  // unevaluatedItems?: ZodJsonSchema<Strict, true>,
  contains?: ZodJsonSchema<Strict>;
  // minContains?: number,
  // maxContains?: number,
  uniqueItems?: boolean;
  minItems?: number;
  maxItems?: number;

  // Factoring
  anyOf?: ZodJsonSchema<Strict>[];
  allOf?: ZodJsonSchema<Strict>[];

  // Conditionals
  not?: ZodJsonSchema<Strict>;

  // Annotations
  title?: string;
  description?: string;
  default?: Json;
  examples?: JsonArray;
  readOnly?: boolean;
  writeOnly?: boolean;

  // Constants
  enum?: JsonArray;
  const?: Json;

  // Structuring
  $ref?: string;
  $defs?: Record<string, ZodJsonSchema<Strict>>;

  // De-facto standard extensions
  errorMessage?: ZodJsonSchemaErrorMessage;
  markdownDescription?: string;
} & (false extends Strict ? JsonObject : unknown);

// export type Parser = ()
