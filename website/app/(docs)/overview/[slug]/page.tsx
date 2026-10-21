import { getOverviewDoc, getOverviewPaths } from "lib/source"
import { createPageMetadata } from "lib/seo"
import type { Metadata } from "next"
import { DocPage } from "components/doc-page"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const doc = getOverviewDoc(slug)

  if (!doc) return {}

  return createPageMetadata({
    title: doc.title,
    description: doc.description,
    path: `/overview/${slug}`,
    image: `/og/overview/${slug}.png`,
  })
}

export async function generateStaticParams() {
  return getOverviewPaths()
}

export default async function OverviewPage({ params }: PageProps) {
  const { slug } = await params
  const doc = getOverviewDoc(slug)

  return <DocPage category="overview" doc={doc} />
}
