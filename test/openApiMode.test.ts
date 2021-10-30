import { z } from "zod";
import { zodToJsonSchema } from "../src/zodToJsonSchema";

describe("Open API target", () => {
  it("should use nullable boolean property and not use $schema property", () => {
    const editCompanySchema = z.object({
      companyId: z.string().nullable(),
      name: z.string().nullable().optional(),
      something: z.literal("hej"),
    });

    const swaggerSchema = zodToJsonSchema(editCompanySchema, {
      target: "openApi",
    });

    const expectedSchema = {
      // $schema: "http://json-schema.org/draft-07/schema#",
      additionalProperties: false,
      properties: {
        companyId: { type: "string", nullable: true },
        name: { type: "string", nullable: true },
        something: { type: "string", enum: ["hej"] },
      },
      required: ["companyId", "something"],
      type: "object",
    };

    expect(swaggerSchema).toStrictEqual(expectedSchema);
  });
});
