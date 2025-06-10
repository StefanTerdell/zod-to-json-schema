import { ZodTypeDef } from "zod";
import { Refs, Seen } from "./Refs.js";
import { ignoreOverride } from "./Options.js";
import { ZodJsonSchema } from "./parseTypes.js";
import { selectParser } from "./selectParser.js";

export const parseDef = (
  def: ZodTypeDef,
  refs: Refs,
  forceResolution = false, // Forces a new schema to be instantiated even though its def has been seen. Used for improving refs in definitions. See https://github.com/StefanTerdell/zod-to-json-schema/pull/61.
): ZodJsonSchema<true> | boolean | null => {
  const seenItem = refs.seen.get(def);

  if (refs.override) {
    const overrideResult = refs.override?.(
      def,
      refs,
      seenItem,
      forceResolution,
    );

    if (overrideResult !== ignoreOverride) {
      return (overrideResult ?? null) as ZodJsonSchema<true> | boolean;
    }
  }

  if (seenItem && !forceResolution) {
    const seenSchema = get$ref(seenItem, refs);

    if (seenSchema !== undefined) {
      return seenSchema;
    }
  }

  const newItem: Seen = seenItem ?? {
    def,
    path: refs.currentPath,
    jsonSchema: null,
  };

  refs.seen.set(def, newItem);

  const jsonSchemaOrGetter = selectParser(def, (def as any).typeName, refs);

  // If the return was a function, then the inner definition needs to be extracted before a call to parseDef (recursive)
  const jsonSchema =
    typeof jsonSchemaOrGetter === "function"
      ? parseDef(jsonSchemaOrGetter(), refs)
      : jsonSchemaOrGetter;

  if (jsonSchema) {
    addMeta(def, refs, jsonSchema);
  }

  if (refs.postProcess) {
    const postProcessResult = refs.postProcess(
      jsonSchema ?? undefined,
      def,
      refs,
    );

    newItem.jsonSchema = jsonSchema;

    return (postProcessResult ?? null) as ZodJsonSchema<true> | boolean;
  }

  newItem.jsonSchema = jsonSchema;

  return jsonSchema;
};

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
  jsonSchema: ZodJsonSchema<true> | boolean,
): ZodJsonSchema<true> | boolean => {
  if (def.description) {
    if (typeof jsonSchema === "boolean") {
      jsonSchema = {
        description: def.description,
      };
    } else {
      jsonSchema.description = def.description;
    }
  }

  if (refs.markdownDescription) {
    if (typeof jsonSchema === "boolean") {
      jsonSchema = {
        markdownDescription: def.description,
      };
    } else {
      jsonSchema.markdownDescription = def.description;
    }
  }

  return jsonSchema;
};
