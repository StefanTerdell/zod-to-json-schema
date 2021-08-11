import { ZodIntersectionDef, ZodParsedType } from "zod";
import { JsonSchema7Type, parseDef, Visited } from "../parseDef";
import { parseObjectDef } from "./object";

export function parseIntersectionDef(
  def: ZodIntersectionDef,
  path: string[],
  visited: Visited
): JsonSchema7Type | undefined {
  const rightDef = def.right._def;
  const leftDef = def.left._def;
  if (
    rightDef.t === ZodParsedType.object &&
    leftDef.t === ZodParsedType.object
  ) {
    const right = parseObjectDef(rightDef, path, visited);
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
  return {
    allOf: [parseDef(leftDef, path, visited), parseDef(rightDef, path, visited)],
  };
}
