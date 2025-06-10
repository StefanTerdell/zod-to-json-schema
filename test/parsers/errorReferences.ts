import { Options } from "../../src/Options.js";
import { getRefs, Refs } from "../../src/Refs.js";

export function errorReferences(
  options?: string | Partial<Options>,
): Refs {
  const r = getRefs(options);
  r.errorMessages = true;
  return r;
}
