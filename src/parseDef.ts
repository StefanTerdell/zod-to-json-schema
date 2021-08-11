import { ZodTypeDef } from "zod";
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
import { parseNullable } from "./parsers/nullable";
import { JsonSchema7NumberType, parseNumberDef } from "./parsers/number";
import { JsonSchema7ObjectType, parseObjectDef } from "./parsers/object";
import { JsonSchema7RecordType, parseRecordDef } from "./parsers/record";
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
  | JsonSchema7AnyType;

export function parseDef<T>(
  schemaDef: any,
  path: string[],
  visited: { def: ZodTypeDef; path: string[] }[]
): JsonSchema7Type | undefined {
  if (visited) {
    const wasVisited = visited.find((x) => Object.is(x.def, schemaDef));
    if (wasVisited) {
      return { $ref: `#/${wasVisited.path.join("/")}` };
    } else {
      visited.push({ def: schemaDef, path });
    }
  }

  const def = schemaDef._def;
  switch (schemaDef.constructor.name) {
    case "ZodString":
      return parseStringDef(def);
    case "ZodNumber":
      return parseNumberDef(def);
    case "ZodObject":
      return parseObjectDef(def, path, visited);
    case "ZodBigInt":
      return parseBigintDef(def);
    case "ZodBoolean":
      return parseBooleanDef();
    case "ZodDate":
      return parseDateDef();
    case "ZodUndefined":
      return parseUndefinedDef();
    case "ZodNull":
      return parseNullDef();
    case "ZodArray":
      return parseArrayDef(def, path, visited, false);
    case "ZodNonEmptyArray":
      return parseArrayDef(def, path, visited, true);
    case "ZodUnion":
      return parseUnionDef(def, path, visited);
    case "ZodIntersection":
      return parseIntersectionDef(def, path, visited);
    case "ZodTuple":
      return parseTupleDef(def, path, visited);
    case "ZodRecord":
      return parseRecordDef(def, path, visited);
    case "ZodLiteral":
      return parseLiteralDef(def);
    case "ZodEnum":
      return parseEnumDef(def);
    case "ZodNativeEnum":
      return parseNativeEnumDef(def);
    case "ZodNullable":
      return parseNullable(def);
    case "ZodOptional":
      return parseDef(def.innerType, path, visited);
    case "ZodEffects":
      const _def: any = parseDef(def.schema, path, visited);
      return {
        ..._def,
        type: (_def.type || "") + " (refinements)",
      };
    case "ZodAny":
    case "ZodUnknown":
      return {};
    case "ZodFunction":
    case "ZodLazy":
    case "ZodPromise":
    case "ZodVoid":
      return undefined;
    default:
      return ((_: unknown) => undefined)(schemaDef);
  }
}
