import { ZodSetDef } from "zod";
import { setResponseValueAndErrors } from "../errorMessages.js";
import { parseDef } from "../parseDef.js";
import { DefParser, ensureObjectSchema } from "../parseTypes.js";

export const parseSetDef: DefParser<ZodSetDef> = (def, refs) => {
  const schema: ReturnType<typeof parseSetDef> = {
    type: "array",
    uniqueItems: true,
  };

  const items = ensureObjectSchema(
    parseDef(def.valueType._def, {
      ...refs,
      currentPath: [...refs.currentPath, "items"],
    }),
  );

  if (items) {
    schema.items = items;
  }

  if (def.minSize) {
    setResponseValueAndErrors(
      schema,
      "minItems",
      def.minSize.value,
      def.minSize.message,
      refs,
    );
  }

  if (def.maxSize) {
    setResponseValueAndErrors(
      schema,
      "maxItems",
      def.maxSize.value,
      def.maxSize.message,
      refs,
    );
  }

  return schema;
};
