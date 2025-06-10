import { ZodJsonSchema  } from "./parseTypes.js";
import { Refs } from "./Refs.js";

export function addErrorMessage(
  schema: ZodJsonSchema<true>,
  key: keyof ZodJsonSchema,
  errorMessage: string | undefined,
  refs: Refs,
) {
  if (!refs?.errorMessages) return;

  if (errorMessage !== undefined) {
    schema.errorMessage = {
      ...schema.errorMessage,
      [key]: errorMessage,
    };
  }
}

export function setResponseValueAndErrors<
  Key extends keyof ZodJsonSchema,
>(
  res: ZodJsonSchema<true>,
  key: Key,
  value: ZodJsonSchema<true>[Key],
  errorMessage: string | undefined,
  refs: Refs,
) {
  res[key] = value;
  addErrorMessage(res, key, errorMessage, refs);
}
