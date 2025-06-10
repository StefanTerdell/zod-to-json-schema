import { ZodPipelineDef, ZodTypeAny } from "zod";
import { parseDef } from "../parseDef.js";
import { DefParser, ensureObjectSchema } from "../parseTypes.js";

export const parsePipelineDef: DefParser<
  ZodPipelineDef<ZodTypeAny, ZodTypeAny>,
  true
> = (def, refs) => {
  if (refs.pipeStrategy === "input") {
    return parseDef(def.in._def, refs);
  } else if (refs.pipeStrategy === "output") {
    return parseDef(def.out._def, refs);
  }

  const a = parseDef(def.in._def, {
    ...refs,
    currentPath: [...refs.currentPath, "allOf", "0"],
  });

  const b = parseDef(def.out._def, {
    ...refs,
    currentPath: [...refs.currentPath, "allOf", a ? "1" : "0"],
  });

  if (a === null) {
    return b;
  }

  if (b === null) {
    return a;
  }

  return {
    allOf: [ensureObjectSchema(a), ensureObjectSchema(b)],
  };
};
