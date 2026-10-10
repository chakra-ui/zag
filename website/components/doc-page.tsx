import DocsLayout from "app/docs-layout"
import { getBody, type Doc } from "lib/source"
import { notFound } from "next/navigation"
import { mdxComponents } from "./mdx-components"

interface DocPageProps {
  category: "overview" | "guides" | "components" | "utilities"
  doc: Doc | undefined
}

export function DocPage({ category, doc }: DocPageProps) {
  if (!doc) notFound()
  const Body = getBody(category, doc.slug)
  return (
    <DocsLayout doc={doc}>
      {Body ? <Body components={mdxComponents} /> : null}
    </DocsLayout>
  )
}
