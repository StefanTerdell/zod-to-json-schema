import { ZodFirstPartyTypeKind, ZodTypeDef } from "zod";
import { parseAnyDef } from "./parsers/any.js";
import { parseArrayDef } from "./parsers/array.js";
import { parseBigintDef } from "./parsers/bigint.js";
import { parseBooleanDef } from "./parsers/boolean.js";
import { parseBrandedDef } from "./parsers/branded.js";
import { parseCatchDef } from "./parsers/catch.js";
import { parseDateDef } from "./parsers/date.js";
import { parseDefaultDef } from "./parsers/default.js";
import { parseEffectsDef } from "./parsers/effects.js";
import { parseEnumDef } from "./parsers/enum.js";
import { parseIntersectionDef } from "./parsers/intersection.js";
import { parseLiteralDef } from "./parsers/literal.js";
import { parseMapDef } from "./parsers/map.js";
import { parseNativeEnumDef } from "./parsers/nativeEnum.js";
import { parseNeverDef } from "./parsers/never.js";
import { parseNullDef } from "./parsers/null.js";
import { parseNullableDef } from "./parsers/nullable.js";
import { parseNumberDef } from "./parsers/number.js";
import { parseObjectDef } from "./parsers/object.js";
import { parseOptionalDef } from "./parsers/optional.js";
import { parsePipelineDef } from "./parsers/pipeline.js";
import { parsePromiseDef } from "./parsers/promise.js";
import { parseRecordDef } from "./parsers/record.js";
import { parseSetDef } from "./parsers/set.js";
import { parseStringDef } from "./parsers/string.js";
import { parseTupleDef } from "./parsers/tuple.js";
import { parseUndefinedDef } from "./parsers/undefined.js";
import { parseUnionDef } from "./parsers/union.js";
import { parseUnknownDef } from "./parsers/unknown.js";
import { Refs } from "./Refs.js";
import { parseReadonlyDef } from "./parsers/readonly.js";
import { ZodJsonSchema } from "./parseTypes.js";

export type InnerDefGetter = () => any;

export const selectParser = (
  def: ZodTypeDef,
  typeName: ZodFirstPartyTypeKind,
  refs: Refs,
): ZodJsonSchema<true> | boolean | InnerDefGetter | null => {
  const defAsAny = def as any

  switch (typeName) {
    case ZodFirstPartyTypeKind.ZodString:
      return parseStringDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodNumber:
      return parseNumberDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodObject:
      return parseObjectDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodBigInt:
      return parseBigintDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodBoolean:
      return parseBooleanDef();
    case ZodFirstPartyTypeKind.ZodDate:
      return parseDateDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodUndefined:
      return parseUndefinedDef();
    case ZodFirstPartyTypeKind.ZodNull:
      return parseNullDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodArray:
      return parseArrayDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodUnion:
    case ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
      return parseUnionDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodIntersection:
      return parseIntersectionDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodTuple:
      return parseTupleDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodRecord:
      return parseRecordDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodLiteral:
      return parseLiteralDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodEnum:
      return parseEnumDef(defAsAny, defAsAny);
    case ZodFirstPartyTypeKind.ZodNativeEnum:
      return parseNativeEnumDef(defAsAny);
    case ZodFirstPartyTypeKind.ZodNullable:
      return parseNullableDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodOptional:
      return parseOptionalDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodMap:
      return parseMapDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodSet:
      return parseSetDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodLazy:
      return () => (defAsAny as any).getter()._def;
    case ZodFirstPartyTypeKind.ZodPromise:
      return parsePromiseDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodNaN:
    case ZodFirstPartyTypeKind.ZodNever:
      return parseNeverDef();
    case ZodFirstPartyTypeKind.ZodEffects:
      return parseEffectsDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodAny:
      return parseAnyDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodUnknown:
      return parseUnknownDef();
    case ZodFirstPartyTypeKind.ZodDefault:
      return parseDefaultDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodBranded:
      return parseBrandedDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodReadonly:
      return parseReadonlyDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodCatch:
      return parseCatchDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodPipeline:
      return parsePipelineDef(defAsAny, refs);
    case ZodFirstPartyTypeKind.ZodFunction:
    case ZodFirstPartyTypeKind.ZodVoid:
    case ZodFirstPartyTypeKind.ZodSymbol:
      return null;
    default:
      /* c8 ignore next */
      return ((_: never) => null)(typeName);
  }
};
