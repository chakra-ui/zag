import { renderOgImage } from "lib/og-image"
import siteConfig from "site.config"

export const dynamic = "force-static"

export function GET() {
  return renderOgImage({
    ...siteConfig.hero,
    code: ["npm install @zag-js/react"],
  })
}
