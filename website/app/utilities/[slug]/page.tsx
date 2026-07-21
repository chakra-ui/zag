import { getUtilityDoc, getUtilityPaths } from "lib/contentlayer-utils"
import { createPageMetadata } from "lib/seo"
import type { Metadata } from "next"
import UtilityPageClient from "./client"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const doc = getUtilityDoc(slug)

  if (!doc) return {}

  return createPageMetadata({
    title: doc.title,
    description: doc.description,
    path: `/utilities/${slug}`,
  })
}

export async function generateStaticParams() {
  return getUtilityPaths()
}

export default async function UtilityPage({ params }: PageProps) {
  const { slug } = await params
  const doc = getUtilityDoc(slug)

  return <UtilityPageClient doc={doc} />
}
