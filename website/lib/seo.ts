import type { Metadata } from "next"
import siteConfig from "site.config"

type PageMetadataInput = {
  title: string
  description: string
  path: string
}

export function createPageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  const url = new URL(path, siteConfig.url).toString()

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      title,
      description,
      siteName: siteConfig.title,
      images: siteConfig.seo.openGraph.images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@zag_js",
      creator: "@zag_js",
    },
  }
}
