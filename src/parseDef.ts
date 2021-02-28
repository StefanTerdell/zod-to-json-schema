import { ZodDef, ZodTypeDef, ZodTypes } from 'zod';
import { parseBigintDef } from './parsers/bigint';
import { parseNumberDef } from './parsers/number';
import { parseStringDef } from './parsers/string';
import { parseUnionDef } from './parsers/union';
import { parseObjectDef } from './parsers/object';
import { parseArrayDef } from './parsers/array';
import { parseNullDef } from './parsers/null';
import { parseUndefinedDef } from './parsers/undefined';
import { parseDateDef } from './parsers/date';
import { parseBooleanDef } from './parsers/boolean';
import { parseTupleDef } from './parsers/tuple';
import { parseRecordDef } from './parsers/record';
import { parseEnumDef } from './parsers/enum';
import { parseNativeEnumDef } from './parsers/nativeEnum';
import { parseLiteralDef } from './parsers/literal';
import { parseIntersectionDef } from './parsers/intersection';
import { JsonSchema } from './JsonSchema';

export function parseDef(schemaDef: ZodTypeDef, path: string[], visited: { def: ZodTypeDef; path: string[] }[]): JsonSchema | undefined {
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
      return {};
    case ZodTypes.unknown:
      return {};
    case ZodTypes.function:
      return undefined;
    case ZodTypes.lazy:
      return undefined;
    case ZodTypes.promise:
      return undefined;
    case ZodTypes.void:
      return undefined;
    default:
      return ((_: never) => undefined)(def);
  }
}
