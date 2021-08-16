# Zod to Json Schema

[![Build](https://img.shields.io/github/workflow/status/stefanterdell/zod-to-json-schema/Tests)](https://github.com/StefanTerdell/zod-to-json-schema)
[![NPM Version](https://img.shields.io/npm/v/zod-to-json-schema.svg)](https://npmjs.org/package/zod-to-json-schema)
[![NPM Downloads](https://img.shields.io/npm/dw/zod-to-json-schema.svg)](https://npmjs.org/package/zod-to-json-schema)

## Summary

Does what it says on the tin; converts [Zod schemas](https://github.com/colinhacks/zod) to [JSON Schemas](https://json-schema.org/)! Supports all relevant schema types, basic string, number and array length validations and string patterns.

Resolves recurring schemas with internal `$ref`s.

Usage:

```typescript
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const mySchema = z.object({
  myString: z.string().min(5),
  myUnion: z.union([z.number(), z.boolean()]),
});

const jsonSchema = zodToJsonSchema(mySchema, "mySchema");
```

Expected output:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "#/definitions/mySchema",
  "definitions": {
    "mySchema": {
      "type": "object",
      "properties": {
        "myString": {
          "type": "string",
          "minLength": 5
        },
        "myUnion": {
          "type": ["number", "boolean"]
        }
      },
      "additionalProperties": false,
      "required": ["myString", "myUnion"]
    }
  }
}
```

## Changelog

| Version | Change                                                                                                                                                                                                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.4.1   | Fixed pathing bug for nullable items.
| 3.4.0   | Added support for z.lazy()                                                                                                                                                                                                                                                                              |
| 3.3.0   | Added support for catchall (additionalProperties schema on objects). Rebuilt object parser.                                                                                                                                                                                                             |
| 3.2.0   | Added support for Map and Set as seen by their most common JSON definitions. Beware no standardized definition seem to exist and JSON.parse doesn't handle either natively. Their implementations here are based on the spread approach. Also further simplified intersection definition to just allOf. |
| 3.1.0   | String patterns finally supported! Fixed bugs include broken external type, unsafe nullable parsing, bad intersection implementation, and missing support for passthrough keys in objects.                                                                                                              |
| 3.0.3   | Fixed array deep pathing bug (path contained `array` instead of `items`)                                                                                                                                                                                                                                |
| 3.0.2   | Fixed broken type usage (NonEmptyArrayDefinition was removed from Zod)                                                                                                                                                                                                                                  |
| 3.0.1   | Fixed a typo in the readme                                                                                                                                                                                                                                                                              |
| 3.0.0   | Compatible with Zod 3.2.0. Huge props to [Mr Hammad Asif](https://github.com/mrhammadasif) for his work on this.                                                                                                                                                                                        |
| 0.6.2   | Hotfix for undefined object properties. Could crash the parser when using Pick                                                                                                                                                                                                                          |
| 0.6.1   | Fixed bug in union pathing. `$Ref` was missing `/anyOf`                                                                                                                                                                                                                                                 |
| 0.6.0   | Moved `@types/json-schema` and `typescript` to dev dependencies. `@types/json-schema` is now only used for the test suites. Using `strict: true` in ts config.                                                                                                                                          |
| 0.5.1   | First working release with all relevant Zod types present with most validations (except for string patterns due to Zod not exposing the source regexp pattern for those).                                                                                                                               |
| < 0.5.1 | Deprecated due to broken package structure. Please be patient, I eat crayons.                                                                                                                                                                                                                           |
