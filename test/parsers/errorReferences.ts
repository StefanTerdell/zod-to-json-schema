import { getRefs, Refs } from '../../src/Refs';

export function errorReferences(): Refs {
  const r = getRefs()
  r.errorMessages = true;
  return r;
}
