import { ZodTypeDef } from "zod";
import { getDefaultOptions, Options } from "./Options";
import { JsonSchema7Type } from "./parseDef";

export type Refs = {
  seen: Map<ZodTypeDef, Seen>;
  currentPath: string[];
  propertyPath: string[] | undefined;
} & Options<"jsonSchema7" | "openApi3">;

export type Seen = {
  def: ZodTypeDef;
  path: string[];
  jsonSchema: JsonSchema7Type | undefined;
};

export const getRefs = (
  options?: string | Partial<Options<"jsonSchema7" | "openApi3">>
): Refs => {
  const _options = getDefaultOptions(options);
  const currentPath =
    _options.name !== undefined
      ? [..._options.basePath, _options.definitionPath, _options.name]
      : _options.basePath;
  return {
    ..._options,
    currentPath: currentPath,
    propertyPath: undefined,
    seen: new Map(
      Object.entries(_options.definitions).map(([name, def]) => [
        def._def,
        {
          def: def._def,
          path: [..._options.basePath, _options.definitionPath, name],
          jsonSchema: undefined,
        },
      ])
    ),
  };
};
