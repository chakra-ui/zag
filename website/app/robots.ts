import type { MetadataRoute } from "next"
import siteConfig from "site.config"

export default function robots(): MetadataRoute.Robots {
  if (siteConfig.noindex) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    }
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // share images and JSON endpoints aren't pages
      disallow: ["/og/", "/api/", "/search.json"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
