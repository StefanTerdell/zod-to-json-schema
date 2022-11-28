import { ZodSchema } from "zod";
import { JsonSchema7Type, parseDef } from "./parseDef";
import { $refStrategy, EffectStrategy, References, Target } from "./References";

const $schema = "http://json-schema.org/draft-07/schema#";

/**
 *
 * @param schema (ZodSchema) The Zod schema to be converted to a JSON schema.
 * @param name (string) The (optional) name of the schema. If provided, schema will be put in definitions/{name}
 */
function zodToJsonSchema<Name extends string | undefined = undefined>(
  schema: ZodSchema<any>,
  name?: Name
): Name extends string
  ? {
      $schema: "http://json-schema.org/draft-07/schema#";
      $ref: `#/definitions/${Name}`;
      definitions: Record<Name, JsonSchema7Type>;
    }
  : { $schema: "http://json-schema.org/draft-07/schema#" } & JsonSchema7Type;

/**
 *
 * @param schema (ZodSchema) The Zod schema to be converted to a JSON schema.
 * @param options (Object) The (optional) options object.
 * @param options.name (string) The (optional) name of the schema. If provided, schema will be put in definitions/{name}
 * @param options.$refStrategy ("root" | "relative" | "none") The (optional) reference builder strategy. Default: "root"
 * @param options.basePath (string[]) The (optional) basePath for the root reference builder strategy. Default: [#]
 * @param options.effectStrategy ("input" | "any") The (optional) effect resolver strategy. Default: "input"
 * @param options.definitionPath ("definitions" | "$defs") defaults to definitions.
 * @param options.target ("jsonSchema7" | "openApi3") defaults to "jsonSchema7"
 * @param options.strictUnions (boolean) defaults to "false". Scrubs unions of any-like json schemas, like `{}` or `true`. Multiple zod types may result in these out of necessity, such as z.instanceof()
 *
 */
function zodToJsonSchema<
  Name extends string | undefined = undefined,
  Strategy extends "root" | "relative" | "none" | undefined = undefined,
  BasePath extends string[] | undefined = undefined,
  DefinitionPath extends "definitions" | "$defs" = "definitions",
  Target extends "jsonSchema7" | "openApi3" | undefined = undefined,
  Definitions extends Record<string, ZodSchema<any>> | undefined = undefined
>(
  schema: ZodSchema<any>,
  options?: {
    name?: Name;
    $refStrategy?: Strategy;
    basePath?: BasePath;
    effectStrategy?: EffectStrategy;
    definitionPath?: DefinitionPath;
    target?: Target;
    strictUnions?: boolean;
    definitions?: Definitions;
  }
): Target extends "openApi3"
  ? Name extends string
    ? BasePath extends string[]
      ? {
          $ref: string;
        } & Record<DefinitionPath, Record<Name | keyof Definitions, object>>
      : Strategy extends "relative"
      ? {
          $ref: `0/${DefinitionPath}/${Name}`;
        } & Record<DefinitionPath, Record<Name | keyof Definitions, object>>
      : {
          $ref: `#/${DefinitionPath}/${Name}`;
        } & Record<DefinitionPath, Record<Name | keyof Definitions, object>>
    : object
  : Name extends string
  ? BasePath extends string[]
    ? {
        $schema: "http://json-schema.org/draft-07/schema#";
        $ref: string;
      } & Record<
        DefinitionPath,
        Record<Name | keyof Definitions, JsonSchema7Type>
      >
    : Strategy extends "relative"
    ? {
        $schema: "http://json-schema.org/draft-07/schema#";
        $ref: `0/${DefinitionPath}/${Name}`;
      } & Record<
        DefinitionPath,
        Record<Name | keyof Definitions, JsonSchema7Type>
      >
    : {
        $schema: "http://json-schema.org/draft-07/schema#";
        $ref: `#/${DefinitionPath}/${Name}`;
      } & Record<
        DefinitionPath,
        Record<Name | keyof Definitions, JsonSchema7Type>
      >
  : Definitions extends undefined
  ? { $schema: "http://json-schema.org/draft-07/schema#" } & JsonSchema7Type
  : { $schema: "http://json-schema.org/draft-07/schema#" } & JsonSchema7Type &
      Record<DefinitionPath, Record<keyof Definitions, JsonSchema7Type>>;

function zodToJsonSchema(
  schema: ZodSchema<any>,
  options?:
    | {
        name?: string;
        $refStrategy?: $refStrategy;
        basePath?: string[];
        effectStrategy?: EffectStrategy;
        definitionPath?: "definitions" | "$defs";
        target?: Target;
        strictUnions?: boolean;
        definitions?: Record<string, ZodSchema<any>>;
      }
    | string
) {
  if (typeof options === "object") {
    const definitionsPath = options.definitionPath ?? "definitions";
    const basePath = options.basePath ?? [
      options.$refStrategy === "relative" ? "0" : "#",
    ];

    const mainPath = [
      ...basePath,
      ...(options.name === undefined ? [] : [definitionsPath, options.name]),
    ];

    let result = parseDef(
      schema._def,
      new References(
        mainPath,
        [],
        options.$refStrategy ?? "root",
        options.effectStrategy,
        options.target,
        undefined,
        options.strictUnions
      ),
      options.definitions && {
        basePath,
        definitionsPath,
        definitions: options.definitions,
      }
    );

    if (options.name !== undefined) {
      let definitions;

      if (result?.[definitionsPath]) {
        definitions = result[definitionsPath];
        delete result[definitionsPath];
      }

      result = {
        $ref: mainPath.join("/"),
        [definitionsPath]: {
          [options.name]: result,
          ...definitions,
        },
      };
    }

    if (options.target !== "openApi3") {
      result = {
        $schema,
        ...result,
      };
    }

    return result ?? {};
  } else if (typeof options === "string") {
    const name = options;
    return {
      $schema,
      $ref: `#/definitions/${name}`,
      definitions: {
        [name]:
          parseDef(schema._def, new References(["#", "definitions", name])) ||
          {},
      },
    };
  } else {
    return {
      $schema,
      ...parseDef(schema._def, new References()),
    };
  }
}

export { zodToJsonSchema };
