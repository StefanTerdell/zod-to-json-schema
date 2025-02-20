import { ZodTypeDef } from "zod";
import { Refs, Seen } from "./Refs.js";
import { ignoreOverride } from "./Options.js";
import { JsonSchema7Type } from "./parseTypes.js";
import { selectParser } from "./selectParser.js";

export function parseDef(
  def: ZodTypeDef,
  refs: Refs,
  forceResolution = false, // Forces a new schema to be instantiated even though its def has been seen. Used for improving refs in definitions. See https://github.com/StefanTerdell/zod-to-json-schema/pull/61.
): JsonSchema7Type | undefined {
  const seenItem = refs.seen.get(def);

  if (refs.override) {
    const overrideResult = refs.override?.(
      def,
      refs,
      seenItem,
      forceResolution,
    );

    if (overrideResult !== ignoreOverride) {
      return overrideResult;
    }
  }

  if (seenItem && !forceResolution) {
    const seenSchema = get$ref(seenItem, refs);

    if (seenSchema !== undefined) {
      return seenSchema;
    }
  }

  const newItem: Seen = { def, path: refs.currentPath, jsonSchema: undefined };

  refs.seen.set(def, newItem);

  let jsonSchema = selectParser(def, (def as any).typeName, refs);

  // If the return was strictly null, then it's a call to parseDef (recursive)
  if (jsonSchema === null) {
    jsonSchema = parseDef((def as any).getter()._def, refs)
  }

  if (jsonSchema) {
    addMeta(def, refs, jsonSchema);
  }

  newItem.jsonSchema = jsonSchema;

  return jsonSchema;
}

const get$ref = (
  item: Seen,
  refs: Refs,
):
  | {
    $ref: string;
  }
  | {}
  | undefined => {
  switch (refs.$refStrategy) {
    case "root":
      return { $ref: item.path.join("/") };
    case "relative":
      return { $ref: getRelativePath(refs.currentPath, item.path) };
    case "none":
    case "seen": {
      if (
        item.path.length < refs.currentPath.length &&
        item.path.every((value, index) => refs.currentPath[index] === value)
      ) {
        console.warn(
          `Recursive reference detected at ${refs.currentPath.join(
            "/",
          )}! Defaulting to any`,
        );

        return {};
      }

      return refs.$refStrategy === "seen" ? {} : undefined;
    }
  }
};

const getRelativePath = (pathA: string[], pathB: string[]) => {
  let i = 0;
  for (; i < pathA.length && i < pathB.length; i++) {
    if (pathA[i] !== pathB[i]) break;
  }
  return [(pathA.length - i).toString(), ...pathB.slice(i)].join("/");
};

const addMeta = (
  def: ZodTypeDef,
  refs: Refs,
  jsonSchema: JsonSchema7Type,
): JsonSchema7Type => {
  if (def.description) {
    jsonSchema.description = def.description;

    if (refs.markdownDescription) {
      jsonSchema.markdownDescription = def.description;
    }
  }
  return jsonSchema;
};
