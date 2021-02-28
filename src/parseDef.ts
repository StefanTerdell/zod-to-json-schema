import { ZodDef, ZodTypeDef, ZodTypes } from 'zod';
import { getBigint } from './parsers/bigint';
import { getNumber } from './parsers/number';
import { parseStringDef } from './parsers/string';
import { getUnion } from './parsers/union';
import { getObject } from './parsers/object';
import { getArray } from './parsers/array';
import { getNull } from './parsers/null';
import { getUndefined } from './parsers/undefined';
import { getDate } from './parsers/date';
import { getBoolean } from './parsers/boolean';
import { getTuple } from './parsers/tuple';
import { getRecord } from './parsers/record';
import { getEnum } from './parsers/enum';
import { getNativeEnum } from './parsers/nativeEnum';
import { getLiteral } from './parsers/literal';
import { getIntersection } from './parsers/intersection';
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
      return getNumber(def);
    case ZodTypes.bigint:
      return getBigint(def);
    case ZodTypes.boolean:
      return getBoolean();
    case ZodTypes.date:
      return getDate();
    case ZodTypes.undefined:
      return getUndefined();
    case ZodTypes.null:
      return getNull();
    case ZodTypes.array:
      return getArray(def, path, visited);
    case ZodTypes.object:
      return getObject(def, path, visited);
    case ZodTypes.union:
      return getUnion(def, path, visited);
    case ZodTypes.intersection:
      return getIntersection(def, path, visited);
    case ZodTypes.tuple:
      return getTuple(def, path, visited);
    case ZodTypes.record:
      return getRecord(def, path, visited);
    case ZodTypes.literal:
      return getLiteral(def);
    case ZodTypes.enum:
      return getEnum(def);
    case ZodTypes.nativeEnum:
      return getNativeEnum(def);
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
