import { z } from "zod";
import { zodToJsonSchema } from "../src/zodToJsonSchema";
import { suite } from "./suite";
import Ajv from "ajv";
import errorMessages from "ajv-errors";

suite("Issue tests", (test) => {
  const ajv = errorMessages(new Ajv({ allErrors: true }));

  test("@94", (assert) => {
    const topicSchema = z.object({
      topics: z
        .array(
          z.object({
            topic: z.string().describe("The topic of the position"),
          }),
        )
        .describe("An array of topics"),
    });

    const res = zodToJsonSchema(topicSchema);

    assert(res, {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      required: ["topics"],
      properties: {
        topics: {
          type: "array",
          items: {
            type: "object",
            required: ["topic"],
            properties: {
              topic: {
                type: "string",
                description: "The topic of the position",
              },
            },
            additionalProperties: false,
          },
          description: "An array of topics",
        },
      },
      additionalProperties: false,
    });
  });

  test("@154", (assert) => {
    const urlRegex =
      /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%,/.\w\-_]*)?\??(?:[-+=&;%@.\w:()_]*)#?(?:[.!/\\\w]*))?)/;

    const URLSchema = z
      .string()
      .min(1)
      .max(1000)
      .regex(urlRegex, { message: "Please enter a valid URL" })
      .brand("url");

    const jsonSchemaJs = zodToJsonSchema(URLSchema, { errorMessages: true });
    const jsonSchema = JSON.parse(JSON.stringify(jsonSchemaJs));

    // Basic conversion checks
    {
      const expected = {
        type: "string",
        minLength: 1,
        maxLength: 1000,
        pattern:
          "^((([A-Za-z]{3,9}:(?:\\/\\/)?)(?:[-;:&=+$,\\w]+@)?[A-Za-z0-9.-]+|(?:www\\.|[-;:&=+$,\\w]+@)[A-Za-z0-9.-]+)((?:\\/[+~%,/.\\w\\-_]*)?\\??(?:[-+=&;%@.\\w:()_]*)#?(?:[.!/\\\\\\w]*))?)",
        errorMessage: { pattern: "Please enter a valid URL" },
        $schema: "http://json-schema.org/draft-07/schema#",
      };

      assert(jsonSchema, expected);
    }

    // Ajv checks
    {
      const ajvSchema = ajv.compile(jsonSchema);

      // @ts-expect-error
      function assertAjvErrors(input: unknown, errorKeywords: string[] | null) {
        assert(ajvSchema(input), !errorKeywords);
        assert(ajvSchema.errors?.map((e) => e.keyword) ?? null, errorKeywords);
      }

      assertAjvErrors(
        "https://github.com/StefanTerdell/zod-to-json-schema/issues/154",
        null,
      );
      assertAjvErrors("", ["minLength", "errorMessage"]);
      assertAjvErrors("invalid url", ["errorMessage"]);
      assertAjvErrors(
        "http://www.ok-url-but-too-long.com/" + "x".repeat(1000),
        ["maxLength"],
      );
      assertAjvErrors("invalid url and too long" + "x".repeat(1000), [
        "maxLength",
        "errorMessage",
      ]);
    }
  });

  test("should be possible to use lazy recursion @162", (assert) => {
    const A: any = z.object({
      ref1: z.lazy(() => B),
    });

    const B = z.object({
      ref1: A,
    });

    const result = zodToJsonSchema(A);

    const expected = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {
        ref1: {
          type: "object",
          properties: {
            ref1: {
              $ref: "#",
            },
          },
          required: ["ref1"],
          additionalProperties: false,
        },
      },
      required: ["ref1"],
      additionalProperties: false,
    };

    assert(result, expected);
  });
});
