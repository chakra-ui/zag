import DocsLayout from "app/docs-layout"
import type { Framework } from "lib/framework-utils"
import { getBody, type Doc } from "lib/source"
import { notFound } from "next/navigation"
import { FrameworkProvider } from "./framework"
import { mdxComponents } from "./mdx-components"

interface DocPageProps {
  category: "overview" | "guides" | "components" | "utilities"
  doc: Doc | undefined
  /** set when the URL names a framework */
  framework?: Framework
}

export function DocPage({ category, doc, framework }: DocPageProps) {
  if (!doc) notFound()
  const Body = getBody(category, doc.slug)
  return (
    <FrameworkProvider value={framework}>
      <DocsLayout doc={doc}>
        {Body ? <Body components={mdxComponents} /> : null}
      </DocsLayout>
    </FrameworkProvider>
  )
}
