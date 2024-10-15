import { ZodSchema } from 'zod';
import { Options, SchemaTargets, Targets } from './Options.js';
import { JsonSchema7Type, parseDef } from './parseDef.js';
import { getRefs } from './Refs.js';

const zodToJsonSchema = <Target extends Targets = SchemaTargets.JSON_SCHEMA_7>(
  schema: ZodSchema<any>,
  options?: Partial<Options<Target>> | string
): (Target extends SchemaTargets.JSON_SCHEMA_7 ? JsonSchema7Type : object) & {
  $schema?: string;
  definitions?: {
    [key: string]: Target extends SchemaTargets.JSON_SCHEMA_7
      ? JsonSchema7Type
      : Target extends SchemaTargets.JSON_SCHEMA_2019_09
      ? JsonSchema7Type
      : object;
  };
} => {
  const refs = getRefs(options);

  const definitions =
    typeof options === 'object' && options.definitions
      ? Object.entries(options.definitions).reduce(
          (acc, [name, schema]) => ({
            ...acc,
            [name]:
              parseDef(
                schema._def,
                {
                  ...refs,
                  currentPath: [...refs.basePath, refs.definitionPath, name],
                },
                true
              ) ?? {},
          }),
          {}
        )
      : undefined;

  const name =
    typeof options === 'string'
      ? options
      : options?.nameStrategy === 'title'
      ? undefined
      : options?.name;

  const main =
    parseDef(
      schema._def,
      name === undefined
        ? refs
        : {
            ...refs,
            currentPath: [...refs.basePath, refs.definitionPath, name],
          },
      false
    ) ?? {};

  const title =
    typeof options === 'object' &&
    options.name !== undefined &&
    options.nameStrategy === 'title'
      ? options.name
      : undefined;

  if (title !== undefined) {
    main.title = title;
  }

  const combined: ReturnType<typeof zodToJsonSchema<Target>> =
    name === undefined
      ? definitions
        ? {
            ...main,
            [refs.definitionPath]: definitions,
          }
        : main
      : {
          $ref: [
            ...(refs.$refStrategy === 'relative' ? [] : refs.basePath),
            refs.definitionPath,
            name,
          ].join('/'),
          [refs.definitionPath]: {
            ...definitions,
            [name]: main,
          },
        };

  switch (refs.target) {
    case SchemaTargets.JSON_SCHEMA_7:
      combined.$schema = 'http://json-schema.org/draft-07/schema#';
      break;
    case SchemaTargets.JSON_SCHEMA_2019_09:
      combined.$schema = 'https://json-schema.org/draft/2019-09/schema#';
      break;
    case SchemaTargets.MONGODB:
      delete combined.$schema;
    default:
      break;
  }

  return combined;
};

export { zodToJsonSchema };
