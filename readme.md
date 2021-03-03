# Zod to Json Schema

[![Build](https://img.shields.io/github/workflow/status/stefanterdell/zod-to-json-schema/Tests)](https://github.com/StefanTerdell/zod-to-json-schema)
[![NPM Version](https://img.shields.io/npm/v/zod-to-json-schema.svg)](https://npmjs.org/package/zod-to-json-schema)
[![NPM Downloads](https://img.shields.io/npm/dw/zod-to-json-schema.svg)](https://npmjs.org/package/zod-to-json-schema)

## Summary

Does what it says on the tin! Supports all relevant schema types as well as basic string, number and array length validations.

String pattern validation (ie email, regexp etc) is not available since Zod doesn't seem to expose the regexp source in any way I can find. Perhaps in later versions, though!

Usage:

```typescript
import * as z from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

const mySchema = z.object({
  myString: z.string().min(5),
  myUnion: z.union([z.number(), z.boolean()]),
});

const jsonSchema = zodToJsonSchema(mySchema, 'mySchema');
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

| Version | Change                                                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.6.1   | Fixed bug in union pathing. `$Ref` was missing `/anyOf`                                                                                                                   |
| 0.6.0   | Moved `@types/json-schema` and `typescript` to dev dependencies. `@types/json-schema` is now only used for the test suites. Using `strict: true` in ts config.            |
| 0.5.1   | First working release with all relevant Zod types present with most validations (except for string patterns due to Zod not exposing the source regexp pattern for those). |
| < 0.5.1 | Deprecated due to broken package structure. Please be patient, I eat crayons.                                                                                             |

## Disclaimer and notes on versioning

Once I'm satisfied that this package has reached parity with Zod I will keep the major versions in lockstep with that, possibly with simultaneous minor versions of both majors 1 and 3 (zod 2 was deprecated before leaving beta). As for now though (meaning major 0 for this package), expect breaking changes to the api to appear without notice.
