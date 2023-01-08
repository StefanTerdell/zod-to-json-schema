import { ZodSchema } from "zod";

export type Options<Target extends "jsonSchema7" | "openApi3" = "jsonSchema7"> =
  {
    name: string | undefined;
    $refStrategy: "root" | "relative" | "none";
    basePath: string[];
    effectStrategy: "input" | "any";
    target: Target;
    strictUnions: boolean;
    definitionPath: string;
    definitions: Record<string, ZodSchema>;
    errorMessages: boolean;
  };

export const defaultOptions: Options = {
  name: undefined,
  $refStrategy: "root",
  basePath: ["#"],
  effectStrategy: "input",
  definitionPath: "definitions",
  target: "jsonSchema7",
  strictUnions: false,
  definitions: {},
  errorMessages: false,
};

export const getDefaultOptions = <Target extends "jsonSchema7" | "openApi3">(
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
