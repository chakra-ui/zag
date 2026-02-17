"use client"

import type { Guide } from ".velite"
import { useMDX } from "components/mdx-components"
import DocsLayout from "../../docs-layout"

type GuidePageClientProps = {
  doc: Guide
}

export default function GuidePageClient({ doc }: GuidePageClientProps) {
  const mdx = useMDX(doc.body.code)

  return <DocsLayout doc={doc}>{mdx}</DocsLayout>
}
