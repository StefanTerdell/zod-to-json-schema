import { suite } from "./suite.js";
import zodToJsonSchema, { ignoreOverride } from "../src";
import { z } from "zod";

suite("override", (test) => {
  test("the readme example", (assert) => {
    assert(
      zodToJsonSchema(
        z.object({
          ignoreThis: z.string(),
          overrideThis: z.string(),
          removeThis: z.string(),
        }),
        {
          override: (def, refs) => {
            const path = refs.currentPath.join("/");

            if (path === "#/properties/overrideThis") {
              return {
                type: "integer",
              };
            }

            if (path === "#/properties/removeThis") {
              return undefined;
            }

            // Important! Do not return `undefined` or void unless you want to remove the property from the resulting schema completely.
            return ignoreOverride;
          },
        },
      ),
      {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        required: ["ignoreThis", "overrideThis"],
        properties: {
          ignoreThis: {
            type: "string",
          },
          overrideThis: {
            type: "integer",
          },
        },
        additionalProperties: false,
      },
    );
  });
});
