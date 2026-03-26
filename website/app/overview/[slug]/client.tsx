"use client"

import type { Overview } from ".velite"
import { useMDX } from "components/mdx-components"
import DocsLayout from "../../docs-layout"

type OverviewPageClientProps = {
  doc: Overview
}

export default function OverviewPageClient({ doc }: OverviewPageClientProps) {
  const mdx = useMDX(doc.body.code)

  return <DocsLayout doc={doc}>{mdx}</DocsLayout>
}
