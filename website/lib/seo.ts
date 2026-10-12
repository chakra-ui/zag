import type { Metadata } from "next"
import siteConfig from "site.config"

type PageMetadataInput = {
  title: string
  description: string
  path: string
  /** a generated share image, e.g. `/og/components/dialog.png` */
  image?: string
  /** set for blog posts, so shares and search show the publish date */
  publishedTime?: Date
}

export function createPageMetadata({
  title,
  description,
  path,
  image,
  publishedTime,
}: PageMetadataInput): Metadata {
  const url = new URL(path, siteConfig.url).toString()

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      ...(publishedTime
        ? { type: "article", publishedTime: publishedTime.toISOString() }
        : { type: "website" }),
      locale: "en_US",
      url,
      title,
      description,
      siteName: siteConfig.title,
      images: image
        ? [{ url: image, width: 1200, height: 630 }]
        : siteConfig.seo.openGraph.images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@zag_js",
      creator: "@zag_js",
      ...(image && { images: [image] }),
    },
  }
}
