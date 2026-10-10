import { extractParams, getComponentDoc, getComponentPaths } from "lib/source"
import { isFramework } from "lib/framework-utils"
import { createPageMetadata } from "lib/seo"
import type { Metadata } from "next"
import { DocPage } from "components/doc-page"

type PageProps = {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { slug: componentSlug } = extractParams(slug)
  const doc = getComponentDoc(componentSlug)

  if (!doc) return {}

  return createPageMetadata({
    title: doc.title,
    description: doc.description,
    path: `/components/${componentSlug}`,
    image: `/og/components/${componentSlug}.png`,
  })
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

  return (
    <DocPage
      category="components"
      doc={doc}
      framework={isFramework(slug[0]) ? framework : undefined}
    />
  )
}
