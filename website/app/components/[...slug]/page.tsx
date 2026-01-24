import {
  extractParams,
  getComponentDoc,
  getComponentPaths,
} from "lib/contentlayer-utils"
import type { Metadata } from "next"
import ComponentPageClient from "./client"

type PageProps = {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { slug: componentSlug } = extractParams(slug)
  const doc = getComponentDoc(componentSlug)

  return {
    title: doc.title,
    description: doc.description,
  }
}

export async function generateStaticParams() {
  return getComponentPaths().map((path) => ({
    slug: path.params.slug,
  }))
}

export default async function ComponentPage({ params }: PageProps) {
  const { slug } = await params
  const { framework, slug: componentSlug } = extractParams(slug)
  const doc = getComponentDoc(componentSlug)

  return <ComponentPageClient doc={doc} framework={framework} />
}
