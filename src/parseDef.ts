import {
  ZodFirstPartyTypeKind, ZodTypeDef
} from "zod";
import { JsonSchema7AnyType, parseAnyDef } from "./parsers/any";
import { JsonSchema7ArrayType, parseArrayDef } from "./parsers/array";
import { JsonSchema7BigintType, parseBigintDef } from "./parsers/bigint";
import { JsonSchema7BooleanType, parseBooleanDef } from "./parsers/boolean";
import { JsonSchema7DateType, parseDateDef } from "./parsers/date";
import { parseDefaultDef } from "./parsers/default";
import { parseEffectsDef } from "./parsers/effects";
import { JsonSchema7EnumType, parseEnumDef } from "./parsers/enum";
import { parseIntersectionDef } from "./parsers/intersection";
import { JsonSchema7LiteralType, parseLiteralDef } from "./parsers/literal";
import { JsonSchema7MapType, parseMapDef } from "./parsers/map";
import {
  JsonSchema7NativeEnumType,
  parseNativeEnumDef
} from "./parsers/nativeEnum";
import { JsonSchema7NeverType, parseNeverDef } from "./parsers/never";
import { JsonSchema7NullType, parseNullDef } from "./parsers/null";
import { JsonSchema7NullableType, parseNullableDef } from "./parsers/nullable";
import { JsonSchema7NumberType, parseNumberDef } from "./parsers/number";
import { JsonSchema7ObjectType, parseObjectDef } from "./parsers/object";
import { parsePromiseDef } from "./parsers/promise";
import { JsonSchema7RecordType, parseRecordDef } from "./parsers/record";
import { parseSetDef } from "./parsers/set";
import { JsonSchema7StringType, parseStringDef } from "./parsers/string";
import { JsonSchema7TupleType, parseTupleDef } from "./parsers/tuple";
import {
  JsonSchema7UndefinedType,
  parseUndefinedDef
} from "./parsers/undefined";
import {
  JsonSchema7AnyOfType,
  JsonSchema7PrimitiveUnionType,
  parseUnionDef
} from "./parsers/union";
import { parseUnknownDef } from "./parsers/unknown";

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
  | JsonSchema7PrimitiveUnionType
  | JsonSchema7UndefinedType
  | JsonSchema7AnyOfType
  | JsonSchema7RefType
  | JsonSchema7NeverType
  | JsonSchema7MapType
  | JsonSchema7AnyType
  | JsonSchema7NullableType
) & { default?: any };

export type Visited = { def: ZodTypeDef; path: string[] }[];

export function parseDef(
  def: ZodTypeDef,
  path: string[],
  visited: Visited
): JsonSchema7Type | undefined {
  const wasVisited = visited.find((x) => Object.is(x.def, def));
  if (wasVisited) {
    return { $ref: `#/${wasVisited.path.join("/")}` };
  } else {
    visited.push({ def, path });
  }

  const defAny = def as any;
  const typeName: ZodFirstPartyTypeKind = defAny.typeName;

  switch (typeName) {
    case ZodFirstPartyTypeKind.ZodString:
      return parseStringDef(defAny);
    case ZodFirstPartyTypeKind.ZodNumber:
      return parseNumberDef(defAny);
    case ZodFirstPartyTypeKind.ZodObject:
      return parseObjectDef(defAny, path, visited);
    case ZodFirstPartyTypeKind.ZodBigInt:
      return parseBigintDef();
    case ZodFirstPartyTypeKind.ZodBoolean:
      return parseBooleanDef();
    case ZodFirstPartyTypeKind.ZodDate:
      return parseDateDef();
    case ZodFirstPartyTypeKind.ZodUndefined:
      return parseUndefinedDef();
    case ZodFirstPartyTypeKind.ZodNull:
      return parseNullDef();
    case ZodFirstPartyTypeKind.ZodArray:
      return parseArrayDef(defAny, path, visited);
    case ZodFirstPartyTypeKind.ZodUnion:
      return parseUnionDef(defAny, path, visited);
    case ZodFirstPartyTypeKind.ZodIntersection:
      return parseIntersectionDef(defAny, path, visited);
    case ZodFirstPartyTypeKind.ZodTuple:
      return parseTupleDef(defAny, path, visited);
    case ZodFirstPartyTypeKind.ZodRecord:
      return parseRecordDef(defAny, path, visited);
    case ZodFirstPartyTypeKind.ZodLiteral:
      return parseLiteralDef(defAny);
    case ZodFirstPartyTypeKind.ZodEnum:
      return parseEnumDef(defAny);
    case ZodFirstPartyTypeKind.ZodNativeEnum:
      return parseNativeEnumDef(defAny);
    case ZodFirstPartyTypeKind.ZodNullable:
      return parseNullableDef(defAny, path, visited);
    case ZodFirstPartyTypeKind.ZodOptional:
      return parseDef(defAny.innerType._def, path, visited);
    case ZodFirstPartyTypeKind.ZodMap:
      return parseMapDef(defAny, path, visited);
    case ZodFirstPartyTypeKind.ZodSet:
      return parseSetDef(defAny, path, visited);
    case ZodFirstPartyTypeKind.ZodLazy:
      return parseDef(defAny.getter()._def, path, visited);
    case ZodFirstPartyTypeKind.ZodPromise:
      return parsePromiseDef(defAny, path, visited);
    case ZodFirstPartyTypeKind.ZodNever:
      return parseNeverDef();
    case ZodFirstPartyTypeKind.ZodEffects:
      return parseEffectsDef(defAny, path, visited);
    case ZodFirstPartyTypeKind.ZodAny:
      return parseAnyDef();
    case ZodFirstPartyTypeKind.ZodUnknown:
      return parseUnknownDef();
    case ZodFirstPartyTypeKind.ZodDefault:
      return parseDefaultDef(defAny, path, visited);
    case ZodFirstPartyTypeKind.ZodFunction:
    case ZodFirstPartyTypeKind.ZodVoid:
      return undefined;
    default:
      return ((_: never) => undefined)(typeName);
  }
}
