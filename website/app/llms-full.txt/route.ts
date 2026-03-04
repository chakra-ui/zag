import { getFullComponentsText } from "lib/component-llm"

export function GET() {
  const text = getFullComponentsText()

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
