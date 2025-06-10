import { ZodSchema } from "zod";
import { Options } from "./Options.js";
import { parseDef } from "./parseDef.js";
import { getRefs } from "./Refs.js";
import {
  ZodJsonSchema,
  ensureObjectSchema,
  isNonNullSchema,
} from "./parseTypes.js";

const zodToJsonSchema = (
  schema: ZodSchema<any>,
  options?: Partial<Options> | string,
): ZodJsonSchema => {
  const refs = getRefs(options);

  const $defsOption =
    typeof options === "object" && (options.$defs ?? options.definitions);

  const $defs =
    $defsOption &&
    Object.keys($defsOption).reduce(
      (acc: Record<string, ZodJsonSchema<true>>, key) => {
        const schema = ensureObjectSchema(
          parseDef(
            $defsOption[key]._def,
            {
              ...refs,
              currentPath: [...refs.basePath, "$defs", key],
            },
            true,
          ),
        );

        if (isNonNullSchema(schema)) {
          acc[key] = schema;
        }

        return acc;
      },
      {},
    );

  const name =
    typeof options === "string"
      ? options
      : options?.nameStrategy === "title"
        ? undefined
        : options?.name;

  const main =
    ensureObjectSchema(
      parseDef(
        schema._def,
        name === undefined
          ? refs
          : {
              ...refs,
              currentPath: [...refs.basePath, "$defs", name],
            },
        false,
      ),
    ) ?? {};

  const title =
    typeof options === "object" &&
    options.name !== undefined &&
    options.nameStrategy === "title"
      ? options.name
      : undefined;

  if (title !== undefined) {
    main.title = title;
  }

  const combined: ZodJsonSchema<true> =
    name === undefined
      ? $defs
        ? {
            ...main,
            $defs,
          }
        : main
      : {
          $ref: [
            ...(refs.$refStrategy === "relative" ? [] : refs.basePath),
            "$defs",
            name,
          ].join("/"),
          $defs: {
            ...$defs,
            [name]: main,
          },
        };

  return combined;
};

export { zodToJsonSchema };
