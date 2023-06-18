import { Options, Targets } from "../../src/Options";
import { getRefs, Refs } from "../../src/Refs";

export function errorReferences(options?: string | Partial<Options<Targets>>): Refs {
  const r = getRefs(options);
  r.errorMessages = true;
  return r;
}
