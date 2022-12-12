import { ZodSchema } from "zod";

export type Options = {
  name: string | undefined;
  $refStrategy: "root" | "relative" | "none";
  basePath: string[];
  effectStrategy: "input" | "any";
  target: "jsonSchema7" | "openApi3";
  strictUnions: boolean;
  definitionPath: string;
  definitions: Record<string, ZodSchema>;
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
};

export const getDefaultOptions = (
  options: Partial<Options> | string | undefined
): Options =>
  typeof options === "string"
    ? {
        ...defaultOptions,
        name: options,
      }
    : {
        ...defaultOptions,
        ...options,
      };
