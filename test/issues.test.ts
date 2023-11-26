import { z } from "zod";
import { zodToJsonSchema } from "../src/zodToJsonSchema";
import { suite } from "./suite";

suite("Issue tests", (test) => {
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
                description: "The topic of the position"
              }
            },
            additionalProperties: false
          },
          description: "An array of topics"
        },
      },
      additionalProperties: false
    });
  });
});
