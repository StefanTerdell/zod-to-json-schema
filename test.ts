import { z } from "zod"
import { zodToJsonSchema } from "./src/zodToJsonSchema"

const a = zodToJsonSchema(z.object({
  hammad: z.string(),
  age: z.number().min(18).max(45)
}))

console.log(JSON.stringify(a, null, 2))