import { ZodSchema, type ZodTypeDef } from "zod";
import type { Refs } from "./Refs";
import type { JsonSchema7Type } from "./parseDef";

export type Targets = "jsonSchema7" | "jsonSchema2019-09" | "openApi3";

export type Options<Target extends Targets = "jsonSchema7"> = {
  name: string | undefined;
  $refStrategy: "root" | "relative" | "none" | "seen";
  basePath: string[];
  effectStrategy: "input" | "any";
  pipeStrategy: "input" | "all";
  dateStrategy: "string" | "integer";
  target: Target;
  strictUnions: boolean;
  definitionPath: string;
  definitions: Record<string, ZodSchema>;
  errorMessages: boolean;
  markdownDescription: boolean;
  emailStrategy: "format:email" | "format:idn-email" | "pattern:zod";
  onParseDef: ((def: ZodTypeDef, refs: Refs, schema: JsonSchema7Type | undefined) => JsonSchema7Type | void) | undefined;
};

export const defaultOptions: Options = {
  name: undefined,
  $refStrategy: "root",
  basePath: ["#"],
  effectStrategy: "input",
  pipeStrategy: "all",
  dateStrategy: "string",
  definitionPath: "definitions",
  target: "jsonSchema7",
  strictUnions: false,
  definitions: {},
  errorMessages: false,
  markdownDescription: false,
  emailStrategy: "format:email",
  onParseDef: undefined,
};

export const getDefaultOptions = <Target extends Targets>(
  options: Partial<Options<Target>> | string | undefined
) =>
  (typeof options === "string"
    ? {
        ...defaultOptions,
        name: options,
      }
    : {
        ...defaultOptions,
        ...options,
      }) as Options<Target>;
