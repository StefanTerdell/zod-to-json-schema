import { ZodFirstPartyTypeKind, ZodLazy, ZodSchema, ZodTypeDef } from "zod";
import { JsonSchema7ArrayType, parseArrayDef } from "./parsers/array";
import { JsonSchema7BigintType, parseBigintDef } from "./parsers/bigint";
import { JsonSchema7BooleanType, parseBooleanDef } from "./parsers/boolean";
import { JsonSchema7DateType, parseDateDef } from "./parsers/date";
import { JsonSchema7EnumType, parseEnumDef } from "./parsers/enum";
import { parseIntersectionDef } from "./parsers/intersection";
import { JsonSchema7LiteralType, parseLiteralDef } from "./parsers/literal";
import {
  JsonSchema7NativeEnumType,
  parseNativeEnumDef,
} from "./parsers/nativeEnum";
import { JsonSchema7NullType, parseNullDef } from "./parsers/null";
import { JsonSchema7NullableType, parseNullableDef } from "./parsers/nullable";
import { JsonSchema7NumberType, parseNumberDef } from "./parsers/number";
import { JsonSchema7ObjectType, parseObjectDef } from "./parsers/object";
import { JsonSchema7RecordType, parseRecordDef } from "./parsers/record";
import { parseSetDef } from "./parsers/set";
import { JsonSchema7MapType, parseMapDef } from "./parsers/map";
import { JsonSchema7StringType, parseStringDef } from "./parsers/string";
import { JsonSchema7TupleType, parseTupleDef } from "./parsers/tuple";
import {
  JsonSchema7UndefinedType,
  parseUndefinedDef,
} from "./parsers/undefined";
import {
  JsonSchema7AnyOfType,
  JsonSchema7PrimitiveUnionType,
  parseUnionDef,
} from "./parsers/union";

type JsonSchema7AnyType = {};
type JsonSchema7RefType = { $ref: string };

export type JsonSchema7Type =
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
  | JsonSchema7AnyType
  | JsonSchema7MapType
  | JsonSchema7NullableType;

export type Visited = { schema: ZodSchema<any>; path: string[] }[];

export function parseDef<T>(
  schema: ZodSchema<any>,
  path: string[],
  visited: Visited
): JsonSchema7Type | undefined {
  const wasVisited = visited.find((x) => Object.is(x.schema, schema));
  if (wasVisited) {
    return { $ref: `#/${wasVisited.path.join("/")}` };
  } else {
    visited.push({ schema, path });
  }

  const def = schema._def as any;
  const typeName: ZodFirstPartyTypeKind = def.typeName as ZodFirstPartyTypeKind;

  switch (typeName) {
    case ZodFirstPartyTypeKind.ZodString:
      return parseStringDef(def);
    case ZodFirstPartyTypeKind.ZodNumber:
      return parseNumberDef(def);
    case ZodFirstPartyTypeKind.ZodObject:
      return parseObjectDef(def, path, visited);
    case ZodFirstPartyTypeKind.ZodBigInt:
      return parseBigintDef(def);
    case ZodFirstPartyTypeKind.ZodBoolean:
      return parseBooleanDef();
    case ZodFirstPartyTypeKind.ZodDate:
      return parseDateDef();
    case ZodFirstPartyTypeKind.ZodUndefined:
      return parseUndefinedDef();
    case ZodFirstPartyTypeKind.ZodNull:
      return parseNullDef();
    case ZodFirstPartyTypeKind.ZodArray:
      return parseArrayDef(def, path, visited);
    case ZodFirstPartyTypeKind.ZodUnion:
      return parseUnionDef(def, path, visited);
    case ZodFirstPartyTypeKind.ZodIntersection:
      return parseIntersectionDef(def, path, visited);
    case ZodFirstPartyTypeKind.ZodTuple:
      return parseTupleDef(def, path, visited);
    case ZodFirstPartyTypeKind.ZodRecord:
      return parseRecordDef(def, path, visited);
    case ZodFirstPartyTypeKind.ZodLiteral:
      return parseLiteralDef(def);
    case ZodFirstPartyTypeKind.ZodEnum:
      return parseEnumDef(def);
    case ZodFirstPartyTypeKind.ZodNativeEnum:
      return parseNativeEnumDef(def);
    case ZodFirstPartyTypeKind.ZodNullable:
      return parseNullableDef(def, path, visited);
    case ZodFirstPartyTypeKind.ZodOptional:
      return parseDef(def.innerType, path, visited);
    case ZodFirstPartyTypeKind.ZodMap:
      return parseMapDef(def, path, visited);
    case ZodFirstPartyTypeKind.ZodSet:
      return parseSetDef(def, path, visited);
    case ZodFirstPartyTypeKind.ZodEffects:
    case ZodFirstPartyTypeKind.ZodAny:
    case ZodFirstPartyTypeKind.ZodUnknown:
    case ZodFirstPartyTypeKind.ZodDefault:
      return {};
      case ZodFirstPartyTypeKind.ZodLazy:
        return parseDef((schema as ZodLazy<any>)._def.getter(), path, visited)
    case ZodFirstPartyTypeKind.ZodNever:
    case ZodFirstPartyTypeKind.ZodFunction:
    case ZodFirstPartyTypeKind.ZodPromise:
    case ZodFirstPartyTypeKind.ZodVoid:
      return undefined;
    default:
      return ((_: never) => undefined)(typeName);
  }
}
