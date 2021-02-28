# Zod to Json Schema

[![Build](https://img.shields.io/github/workflow/status/stefanterdell/zod-to-json-schema/Tests)](https://github.com/StefanTerdell/zod-to-json-schema)
[![NPM Version](https://img.shields.io/npm/v/zod-to-json-schema.svg)](https://npmjs.org/package/zod-to-json-schema)
[![NPM Downloads](https://img.shields.io/npm/dw/zod-to-json-schema.svg)](https://npmjs.org/package/zod-to-json-schema)

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

| Version | Change                                                                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 0.3.0   | Mainly project restructuing and (hopefuly) final semi-breaking change to external api (renamed main function). Added this changelog. |
| 0.2.1   | Tiny readme update.                                                                                                                  |
| 0.2.0   | Added native enum support.                                                                                                           |
| 0.1.0   | Basic validations for all relevant types. Breaking change to external api.                                                           |
| 0.0.0   | Basic parsing without validation                                                                                                     |

## Disclaimer and notes on versioning

Once I'm satisfied that this package has reached parity with Zod I will keep the major versions in lockstep with that, possibly with simultaneous minor versions of both majors 1 and 3 (zod 2 was deprecated before leaving beta). As for now though (meaning major 0 for this package), expect breaking changes to the api to appear without notice.
