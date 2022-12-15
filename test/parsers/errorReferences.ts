import { getRefs, Refs } from '../../src/refs';

export function errorReferences(): Refs {
  const r = getRefs()
  r.errorMessages = true;
  return r;
}
