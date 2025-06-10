import { ZodTypeDef } from "zod";
import { getDefaultOptions, Options } from "./Options.js";
import { ZodJsonSchema } from "./parseTypes.js";

export type Refs = {
  seen: Map<ZodTypeDef, Seen>;
  currentPath: string[];
  propertyPath: string[] | undefined;
} & Options;

export type Seen = {
  def: ZodTypeDef;
  path: string[];
  jsonSchema: ZodJsonSchema<true> | boolean | null;
};

export const getRefs = (options?: string | Partial<Options>): Refs => {
  const _options = getDefaultOptions(options);
  const currentPath =
    _options.name !== undefined
      ? [..._options.basePath, "$defs", _options.name]
      : _options.basePath;
  return {
    ..._options,
    currentPath: currentPath,
    propertyPath: undefined,
    seen: new Map(
      Object.entries(_options.$defs ?? _options.definitions).map(
        ([key, schema]) => [
          schema._def,
          {
            def: schema._def,
            path: [..._options.basePath, "$defs", key],
            // Resolution of references will be forced even though seen, so it's ok that the schema is undefined here for now.
            jsonSchema: null,
          },
        ],
      ),
    ),
  };
};
