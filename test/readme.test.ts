import { z } from "zod";
import zodToJsonSchema, { ZodJsonSchema } from "../src";
import { suite } from "./suite.js";

suite("The readme example", (test) => {
  test("should be valid", (assert) => {
    const mySchema = z
      .object({
        myString: z.string().min(5),
        myUnion: z.union([z.number(), z.boolean()]),
      })
      .describe("My neat object schema");

    const jsonSchema = zodToJsonSchema(mySchema, "mySchema");

    const expected: ZodJsonSchema = {
      $ref: "#/$defs/mySchema",
      $defs: {
        mySchema: {
          description: "My neat object schema",
          type: "object",
          properties: {
            myString: {
              type: "string",
              minLength: 5,
            },
            myUnion: {
              type: ["number", "boolean"],
            },
          },
          additionalProperties: false,
          required: ["myString", "myUnion"],
        },
      },
    };

    assert(jsonSchema, expected);
  });
  test("should have a valid error message example", (assert) => {
    const EmailSchema = z.string().email("Invalid email").min(5, "Too short");
    const expected: ZodJsonSchema = {
      type: "string",
      format: "email",
      minLength: 5,
      errorMessage: {
        format: "Invalid email",
        minLength: "Too short",
      },
    };
    const parsedJsonSchema = zodToJsonSchema(EmailSchema, {
      errorMessages: true,
    });
    assert(parsedJsonSchema, expected);
  });
});
