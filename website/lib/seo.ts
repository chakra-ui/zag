import type { Metadata } from "next"
import siteConfig from "site.config"

type PageMetadataInput = {
  title: string
  description: string
  path: string
  /** a generated share image, e.g. `/og/components/dialog.png` */
  image?: string
}

export function createPageMetadata({
  title,
  description,
  path,
  image,
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
