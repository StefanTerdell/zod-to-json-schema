import { ZodDef, ZodTypeDef, ZodTypes } from 'zod';
import { JsonSchema7ArrayType, parseArrayDef } from './parsers/array';
import { JsonSchema7BigintType, parseBigintDef } from './parsers/bigint';
import { JsonSchema7BooleanType, parseBooleanDef } from './parsers/boolean';
import { JsonSchema7DateType, parseDateDef } from './parsers/date';
import { JsonSchema7EnumType, parseEnumDef } from './parsers/enum';
import { parseIntersectionDef } from './parsers/intersection';
import { JsonSchema7LiteralType, parseLiteralDef } from './parsers/literal';
import { JsonSchema7NativeEnumType, parseNativeEnumDef } from './parsers/nativeEnum';
import { JsonSchema7NullType, parseNullDef } from './parsers/null';
import { JsonSchema7NumberType, parseNumberDef } from './parsers/number';
import { JsonSchema7ObjectType, parseObjectDef } from './parsers/object';
import { JsonSchema7RecordType, parseRecordDef } from './parsers/record';
import { JsonSchema7StringType, parseStringDef } from './parsers/string';
import { JsonSchema7TupleType, parseTupleDef } from './parsers/tuple';
import { JsonSchema7UndefinedType, parseUndefinedDef } from './parsers/undefined';
import { JsonSchema7AnyOfType, JsonSchema7PrimitiveUnionType, parseUnionDef } from './parsers/union';

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
  | JsonSchema7AnyType;

export function parseDef(schemaDef: ZodTypeDef, path: string[], visited: { def: ZodTypeDef; path: string[] }[]): JsonSchema7Type | undefined {
  if (visited) {
    const wasVisited = visited.find((x) => Object.is(x.def, schemaDef));
    if (wasVisited) {
      return { $ref: `#/${wasVisited.path.join('/')}` };
    } else {
      visited.push({ def: schemaDef, path });
    }
  }
  const def: ZodDef = schemaDef as any;
  switch (def.t) {
    case ZodTypes.string:
      return parseStringDef(def);
    case ZodTypes.number:
      return parseNumberDef(def);
    case ZodTypes.bigint:
      return parseBigintDef(def);
    case ZodTypes.boolean:
      return parseBooleanDef();
    case ZodTypes.date:
      return parseDateDef();
    case ZodTypes.undefined:
      return parseUndefinedDef();
    case ZodTypes.null:
      return parseNullDef();
    case ZodTypes.array:
      return parseArrayDef(def, path, visited);
    case ZodTypes.object:
      return parseObjectDef(def, path, visited);
    case ZodTypes.union:
      return parseUnionDef(def, path, visited);
    case ZodTypes.intersection:
      return parseIntersectionDef(def, path, visited);
    case ZodTypes.tuple:
      return parseTupleDef(def, path, visited);
    case ZodTypes.record:
      return parseRecordDef(def, path, visited);
    case ZodTypes.literal:
      return parseLiteralDef(def);
    case ZodTypes.enum:
      return parseEnumDef(def);
    case ZodTypes.nativeEnum:
      return parseNativeEnumDef(def);
    case ZodTypes.any:
    case ZodTypes.unknown:
      return {};
    case ZodTypes.function:
    case ZodTypes.lazy:
    case ZodTypes.promise:
    case ZodTypes.void:
      return undefined;
    default:
      return ((_: never) => undefined)(def);
  }
}
