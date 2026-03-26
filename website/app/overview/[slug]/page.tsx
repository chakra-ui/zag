import { getOverviewDoc, getOverviewPaths } from "lib/contentlayer-utils"
import type { Metadata } from "next"
import OverviewPageClient from "./client"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const doc = getOverviewDoc(slug)

  return {
    title: doc.title,
    description: doc.description,
  }
}

export async function generateStaticParams() {
  return getOverviewPaths()
}

export default async function OverviewPage({ params }: PageProps) {
  const { slug } = await params
  const doc = getOverviewDoc(slug)

  return <OverviewPageClient doc={doc} />
}
