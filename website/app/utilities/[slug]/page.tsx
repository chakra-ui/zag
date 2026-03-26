import { getUtilityDoc, getUtilityPaths } from "lib/contentlayer-utils"
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

  return {
    title: doc.title,
    description: doc.description,
  }
}

export async function generateStaticParams() {
  return getUtilityPaths()
}

export default async function UtilityPage({ params }: PageProps) {
  const { slug } = await params
  const doc = getUtilityDoc(slug)

  return <UtilityPageClient doc={doc} />
}
