import { ZodFirstPartyTypeKind, ZodSchema, ZodTypeDef } from "zod";
import { JsonSchema7AnyType, parseAnyDef } from "./parsers/any";
import { JsonSchema7ArrayType, parseArrayDef } from "./parsers/array";
import { JsonSchema7BigintType, parseBigintDef } from "./parsers/bigint";
import { JsonSchema7BooleanType, parseBooleanDef } from "./parsers/boolean";
import { parseBrandedDef } from "./parsers/branded";
import { JsonSchema7DateType, parseDateDef } from "./parsers/date";
import { parseDefaultDef } from "./parsers/default";
import { parseEffectsDef } from "./parsers/effects";
import { JsonSchema7EnumType, parseEnumDef } from "./parsers/enum";
import {
  JsonSchema7AllOfType,
  parseIntersectionDef,
} from "./parsers/intersection";
import { JsonSchema7LiteralType, parseLiteralDef } from "./parsers/literal";
import { JsonSchema7MapType, parseMapDef } from "./parsers/map";
import {
  JsonSchema7NativeEnumType,
  parseNativeEnumDef,
} from "./parsers/nativeEnum";
import { JsonSchema7NeverType, parseNeverDef } from "./parsers/never";
import { JsonSchema7NullType, parseNullDef } from "./parsers/null";
import { JsonSchema7NullableType, parseNullableDef } from "./parsers/nullable";
import { JsonSchema7NumberType, parseNumberDef } from "./parsers/number";
import { JsonSchema7ObjectType, parseObjectDef } from "./parsers/object";
import { parseOptionalDef } from "./parsers/optional";
import { parsePromiseDef } from "./parsers/promise";
import { JsonSchema7RecordType, parseRecordDef } from "./parsers/record";
import { JsonSchema7SetType, parseSetDef } from "./parsers/set";
import { JsonSchema7StringType, parseStringDef } from "./parsers/string";
import { JsonSchema7TupleType, parseTupleDef } from "./parsers/tuple";
import {
  JsonSchema7UndefinedType,
  parseUndefinedDef,
} from "./parsers/undefined";
import { JsonSchema7UnionType, parseUnionDef } from "./parsers/union";
import { JsonSchema7UnknownType, parseUnknownDef } from "./parsers/unknown";
import { Item, References } from "./References";

type JsonSchema7RefType = { $ref: string };

export type JsonSchema7Type = (
  | JsonSchema7StringType
  | JsonSchema7ArrayType
  | JsonSchema7NumberType
  | JsonSchema7BigintType
  | JsonSchema7BooleanType
  | JsonSchema7DateType
  | JsonSchema7EnumType
  | JsonSchema7LiteralType
  | JsonSchema7NativeEnumType
  | JsonSchema7NullType
  | JsonSchema7NumberType
  | JsonSchema7ObjectType
  | JsonSchema7RecordType
  | JsonSchema7TupleType
  | JsonSchema7UnionType
  | JsonSchema7UndefinedType
  | JsonSchema7RefType
  | JsonSchema7NeverType
  | JsonSchema7MapType
  | JsonSchema7AnyType
  | JsonSchema7NullableType
  | JsonSchema7AllOfType
  | JsonSchema7UnknownType
  | JsonSchema7SetType
) & { default?: any; description?: string } & { [key: string]: any };

export function parseDef(
  def: ZodTypeDef,
  refs: References,
  preloadDefinitions?: Record<string, ZodSchema<any>>,
  definitionsPath: string = "definitions"
): JsonSchema7Type | undefined {
  const definitionSchemas = getPreloadedDefinitionSchemas(
    refs,
    definitionsPath,
    preloadDefinitions
  );

  const seenItem = refs.items.find((x) => Object.is(x.def, def));

  if (seenItem) {
    return select$refStrategy(seenItem, refs);
  }

  const newItem: Item = { def, path: refs.currentPath, jsonSchema: undefined };

  refs.items.push(newItem);

  const jsonSchema = selectParser(def, (def as any).typeName, refs);

  if (jsonSchema) {
    addMeta(def, jsonSchema);
    addDefinitionSchemas(jsonSchema, definitionSchemas, definitionsPath);
  }

  newItem.jsonSchema = jsonSchema;

  return jsonSchema;
}

const select$refStrategy = (
  item: Item,
  refs: References
):
  | {
      $ref: string;
    }
  | {}
  | undefined => {
  switch (refs.$refStrategy) {
    case "root":
      return {
        $ref:
          item.path.length === 0
            ? ""
            : item.path.length === 1
            ? `${item.path[0]}/`
            : item.path.join("/"),
      };
    case "relative":
      return { $ref: makeRelativePath(refs.currentPath, item.path) };
    case "none": {
      if (
        item.path.length < refs.currentPath.length &&
        item.path.every((value, index) => refs.currentPath[index] === value)
      ) {
        console.warn(
          `Recursive reference detected at ${refs.currentPath.join(
            "/"
          )}! Defaulting to any`
        );
        return {};
      } else {
        return item.jsonSchema;
      }
    }
  }
};

const makeRelativePath = (pathA: string[], pathB: string[]) => {
  let i = 0;
  for (; i < pathA.length && i < pathB.length; i++) {
    if (pathA[i] !== pathB[i]) break;
  }
  return [(pathA.length - i).toString(), ...pathB.slice(i)].join("/");
};

const selectParser = (
  def: any,
  typeName: ZodFirstPartyTypeKind,
  refs: References
): JsonSchema7Type | undefined => {
  switch (typeName) {
    case ZodFirstPartyTypeKind.ZodString:
      return parseStringDef(def);
    case ZodFirstPartyTypeKind.ZodNumber:
      return parseNumberDef(def, refs);
    case ZodFirstPartyTypeKind.ZodObject:
      return parseObjectDef(def, refs);
    case ZodFirstPartyTypeKind.ZodBigInt:
      return parseBigintDef();
    case ZodFirstPartyTypeKind.ZodBoolean:
      return parseBooleanDef();
    case ZodFirstPartyTypeKind.ZodDate:
      return parseDateDef();
    case ZodFirstPartyTypeKind.ZodUndefined:
      return parseUndefinedDef();
    case ZodFirstPartyTypeKind.ZodNull:
      return parseNullDef(refs);
    case ZodFirstPartyTypeKind.ZodArray:
      return parseArrayDef(def, refs);
    case ZodFirstPartyTypeKind.ZodUnion:
    case ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
      return parseUnionDef(def, refs);
    case ZodFirstPartyTypeKind.ZodIntersection:
      return parseIntersectionDef(def, refs);
    case ZodFirstPartyTypeKind.ZodTuple:
      return parseTupleDef(def, refs);
    case ZodFirstPartyTypeKind.ZodRecord:
      return parseRecordDef(def, refs);
    case ZodFirstPartyTypeKind.ZodLiteral:
      return parseLiteralDef(def, refs);
    case ZodFirstPartyTypeKind.ZodEnum:
      return parseEnumDef(def);
    case ZodFirstPartyTypeKind.ZodNativeEnum:
      return parseNativeEnumDef(def);
    case ZodFirstPartyTypeKind.ZodNullable:
      return parseNullableDef(def, refs);
    case ZodFirstPartyTypeKind.ZodOptional:
      return parseOptionalDef(def, refs);
    case ZodFirstPartyTypeKind.ZodMap:
      return parseMapDef(def, refs);
    case ZodFirstPartyTypeKind.ZodSet:
      return parseSetDef(def, refs);
    case ZodFirstPartyTypeKind.ZodLazy:
      return parseDef(def.getter()._def, refs);
    case ZodFirstPartyTypeKind.ZodPromise:
      return parsePromiseDef(def, refs);
    case ZodFirstPartyTypeKind.ZodNaN:
    case ZodFirstPartyTypeKind.ZodNever:
      return parseNeverDef();
    case ZodFirstPartyTypeKind.ZodEffects:
      return parseEffectsDef(def, refs);
    case ZodFirstPartyTypeKind.ZodAny:
      return parseAnyDef();
    case ZodFirstPartyTypeKind.ZodUnknown:
      return parseUnknownDef();
    case ZodFirstPartyTypeKind.ZodDefault:
      return parseDefaultDef(def, refs);
    case ZodFirstPartyTypeKind.ZodBranded:
      return parseBrandedDef(def, refs);
    case ZodFirstPartyTypeKind.ZodFunction:
    case ZodFirstPartyTypeKind.ZodVoid:
      return undefined;
    default:
      return ((_: never) => undefined)(typeName);
  }
};

const addMeta = (
  def: ZodTypeDef,
  jsonSchema: JsonSchema7Type
): JsonSchema7Type => {
  if (def.description) jsonSchema.description = def.description;
  return jsonSchema;
};

const getPreloadedDefinitionSchemas = (
  refs: References,
  definitionsPath: string,
  definitions: Record<string, ZodSchema<any>> | undefined
) =>
  definitions
    ? Object.entries(definitions).reduce(
        (acc: Record<string, JsonSchema7Type>, [key, schema]) => {
          const jsonSchema = selectParser(
            schema._def,
            (schema._def as any).typeName,
            refs
          );

          if (jsonSchema) {
            refs.items.push({
              def: schema._def,
              path: ["#", definitionsPath, key],
              jsonSchema,
            });

            acc[key] = jsonSchema;
          }

          return acc;
        },
        {}
      )
    : undefined;

const addDefinitionSchemas = (
  jsonSchema: JsonSchema7Type,
  definitionSchemas: Record<string, JsonSchema7Type> | undefined,
  definitionsPath: string
) => {
  if (definitionSchemas) {
    jsonSchema[definitionsPath] = {
      ...definitionSchemas,
      ...jsonSchema[definitionsPath],
    };
  }
};
