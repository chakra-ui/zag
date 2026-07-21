import { getGuideDoc, getGuidePaths } from "lib/contentlayer-utils"
import { createPageMetadata } from "lib/seo"
import type { Metadata } from "next"
import GuidePageClient from "./client"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const doc = getGuideDoc(slug)

  if (!doc) return {}

  return createPageMetadata({
    title: doc.title,
    description: doc.description,
    path: `/guides/${slug}`,
  })
}

export async function generateStaticParams() {
  return getGuidePaths()
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params
  const doc = getGuideDoc(slug)

  return <GuidePageClient doc={doc} />
}
