import {
  getComponentPaths,
  getGuidePaths,
  getOverviewPaths,
  getUtilityPaths,
} from "lib/contentlayer-utils"
import type { MetadataRoute } from "next"
import siteConfig from "site.config"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const staticRoutes = ["", "/community", "/showcase"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified,
  }))

  // Prefer canonical component URLs (no framework prefix) for search engines.
  const componentRoutes = getComponentPaths()
    .map(({ params }) => params.slug)
    .filter((slug) => slug.length === 1)
    .map((slug) => ({
      url: `${siteConfig.url}/components/${slug[0]}`,
      lastModified,
    }))

  const overviewRoutes = getOverviewPaths().map(({ slug }) => ({
    url: `${siteConfig.url}/overview/${slug}`,
    lastModified,
  }))

  const guideRoutes = getGuidePaths().map(({ slug }) => ({
    url: `${siteConfig.url}/guides/${slug}`,
    lastModified,
  }))

  const utilityRoutes = getUtilityPaths().map(({ slug }) => ({
    url: `${siteConfig.url}/utilities/${slug}`,
    lastModified,
  }))

  return [
    ...staticRoutes,
    ...componentRoutes,
    ...overviewRoutes,
    ...guideRoutes,
    ...utilityRoutes,
  ]
}
