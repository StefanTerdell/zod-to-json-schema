import { ZodSchema, ZodTypeDef } from "zod";
import { Refs, Seen } from "./Refs";
import { ZodJsonSchema } from "./parseTypes";

export type Targets =
  | "jsonSchema7"
  | "jsonSchema2019-09"
  | "openApi3"
  | "openAi";

export type DateStrategy =
  | "format:date-time"
  | "format:date"
  | "string"
  | "integer";

export const ignoreOverride = Symbol(
  "Let zodToJsonSchema decide on which parser to use",
);

export type OverrideCallback = (
  def: ZodTypeDef,
  refs: Refs,
  seen: Seen | undefined,
  forceResolution?: boolean,
) => ZodJsonSchema | boolean | undefined | typeof ignoreOverride;

export type PostProcessCallback = (
  jsonSchema: ZodJsonSchema | boolean | undefined,
  def: ZodTypeDef,
  refs: Refs,
) => ZodJsonSchema | boolean | undefined;

export const jsonDescription: PostProcessCallback = (jsonSchema, def) => {
  if (!def.description) {
    return jsonSchema;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(def.description);
  } catch {
    return jsonSchema;
  }

  if (typeof parsed !== "object" || Array.isArray(parsed) || !parsed) {
    return jsonSchema;
  }

  if (typeof jsonSchema === "boolean") {
    return jsonSchema
      ? parsed
      : {
          not: true,
          ...parsed,
        };
  } else {
    return {
      ...jsonSchema,
      ...parsed,
    };
  }
};

export type Options = {
  name: string | undefined;
  $refStrategy: "root" | "relative" | "none" | "seen";
  basePath: string[];
  effectStrategy: "input" | "any";
  pipeStrategy: "input" | "output" | "all";
  dateStrategy: DateStrategy | DateStrategy[];
  mapStrategy: "entries" | "record";
  removeAdditionalStrategy: "passthrough" | "strict";
  allowedAdditionalProperties: true | undefined;
  rejectedAdditionalProperties: false | undefined;
  strictUnions: boolean;
  errorMessages: boolean;
  markdownDescription: boolean;
  patternStrategy: "escape" | "preserve";
  applyRegexFlags: boolean;
  emailStrategy: "format:email" | "format:idn-email" | "pattern:zod";
  base64Strategy: "format:binary" | "contentEncoding:base64" | "pattern:zod";
  nameStrategy: "ref" | "title";
  override?: OverrideCallback;
  postProcess?: PostProcessCallback;
} & (
  | {
      $defs?: undefined;
      /** @deprecated use `$defs` instead */
      definitions: Record<string, ZodSchema>;
    }
  | {
      $defs: Record<string, ZodSchema>;
      /** @deprecated use `$defs` instead */
      definitions?: undefined;
    }
);

export const defaultOptions: Options = {
  name: undefined,
  $refStrategy: "root",
  basePath: ["#"],
  effectStrategy: "input",
  pipeStrategy: "all",
  dateStrategy: "format:date-time",
  mapStrategy: "entries",
  removeAdditionalStrategy: "passthrough",
  allowedAdditionalProperties: true,
  rejectedAdditionalProperties: false,
  strictUnions: false,
  $defs: {},
  errorMessages: false,
  markdownDescription: false,
  patternStrategy: "escape",
  applyRegexFlags: false,
  emailStrategy: "format:email",
  base64Strategy: "contentEncoding:base64",
  nameStrategy: "ref",
};

export const getDefaultOptions = (
  options: Partial<Options> | string | undefined,
) =>
  (typeof options === "string"
    ? {
        ...defaultOptions,
        name: options,
      }
    : {
        ...defaultOptions,
        ...options,
      }) as Options;
