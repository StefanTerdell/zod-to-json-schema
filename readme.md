# Zod to Json Schema

[![Build](https://img.shields.io/github/workflow/status/stefanterdell/zod-to-json-schema/Tests)](https://github.com/StefanTerdell/zod-to-json-schema)
[![NPM Version](https://img.shields.io/npm/v/zod-to-json-schema.svg)](https://npmjs.org/package/zod-to-json-schema)
[![NPM Downloads](https://img.shields.io/npm/dw/zod-to-json-schema.svg)](https://npmjs.org/package/zod-to-json-schema)

Does what it says on the tin! Currently missing any form of validations, just the bare minimum so far.

Usage:

```typescript
import * as z from 'zod';
import toJsonSchema from 'zod-to-json-schema';

const mySchema = z.object({
  myString: z.string(),
  myUnion: z.union([z.number(), z.boolean()]),
});

const jsonSchema = toJsonSchema({ mySchema });
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
          "type": "string"
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
