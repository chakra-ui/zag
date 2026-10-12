import {
  posts,
  getComponentPaths,
  getGuidePaths,
  getOverviewPaths,
  getUtilityPaths,
} from "lib/source"
import type { MetadataRoute } from "next"
import siteConfig from "site.config"

export default function sitemap(): MetadataRoute.Sitemap {
  if (siteConfig.noindex) return []

  // Only posts carry a real date. A build timestamp would mark every page as
  // changed on every deploy, so the rest leave lastModified out
  const staticRoutes = ["", "/blog", "/community", "/team", "/showcase"].map(
    (path) => ({
      url: `${siteConfig.url}${path}`,
    }),
  )

  // Prefer canonical component URLs (no framework prefix) for search engines.
  const componentRoutes = getComponentPaths()
    .map(({ params }) => params.slug)
    .filter((slug) => slug.length === 1)
    .map((slug) => ({
      url: `${siteConfig.url}/components/${slug[0]}`,
    }))

  const overviewRoutes = getOverviewPaths().map(({ slug }) => ({
    url: `${siteConfig.url}/overview/${slug}`,
  }))

  const guideRoutes = getGuidePaths().map(({ slug }) => ({
    url: `${siteConfig.url}/guides/${slug}`,
  }))

  const utilityRoutes = getUtilityPaths().map(({ slug }) => ({
    url: `${siteConfig.url}/utilities/${slug}`,
  }))

  const postRoutes = posts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: post.date,
  }))

  return [
    ...staticRoutes,
    ...postRoutes,
    ...componentRoutes,
    ...overviewRoutes,
    ...guideRoutes,
    ...utilityRoutes,
  ]
}
