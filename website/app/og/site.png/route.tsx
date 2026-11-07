import { renderOgImage } from "lib/og-image"

export const dynamic = "force-static"

export function GET() {
  return renderOgImage({
    title: "Accessible components for any framework",
    description:
      "60+ components with keyboard, focus and screen reader support built in. Use them in React, Vue, Solid, Svelte or Preact",
    code: ["npm install @zag-js/react"],
  })
}
