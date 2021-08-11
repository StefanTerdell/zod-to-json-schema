import { ZodIntersectionDef, ZodParsedType, ZodTypeDef } from "zod";
import { JsonSchema7Type, parseDef } from "../parseDef";
import { parseObjectDef } from "./object";

export function parseIntersectionDef(
  def: ZodIntersectionDef,
  path: string[],
  visited: { def: ZodTypeDef; path: string[] }[]
): JsonSchema7Type | undefined {
  const rightDef = def.right._def;
  if (rightDef.t === ZodParsedType.object) {
    const right = parseObjectDef(rightDef, path, visited);
    const leftDef = def.left._def;
    if (leftDef.t === ZodParsedType.object) {
      const left = parseObjectDef(leftDef, path, visited);
      return {
        type: "object",
        properties: { ...left.properties, ...right.properties },
        required: [
          ...(left.required || []).filter(
            (x) => !Object.keys(right.properties).includes(x)
          ),
          ...(right.required || []),
        ],
      };
    }
    return right;
  }
  return parseDef(rightDef, path, visited);
}
