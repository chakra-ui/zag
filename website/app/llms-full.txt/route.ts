import { getFullComponentsText } from "lib/component-llm"

export const dynamic = "force-static"

export function GET() {
  const text = getFullComponentsText()

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  })
}
