import { getComponentsPerFramework } from "lib/component-llm"

export const dynamic = "force-static"

export function GET() {
  const text = getComponentsPerFramework("react")

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  })
}
