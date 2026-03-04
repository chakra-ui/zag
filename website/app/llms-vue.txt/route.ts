import { getComponentsPerFramework } from "lib/component-llm"

export function GET() {
  const text = getComponentsPerFramework("vue")

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
