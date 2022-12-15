import { References } from "../../src/References";

export function errorReferences(): References {
  const r = new References();
  r.errorMessages = true;
  return r;
}
