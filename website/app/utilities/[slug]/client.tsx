"use client"

import type { Utility } from ".velite"
import { useMDX } from "components/mdx-components"
import DocsLayout from "../../docs-layout"

type UtilityPageClientProps = {
  doc: Utility
}

export default function UtilityPageClient({ doc }: UtilityPageClientProps) {
  const mdx = useMDX(doc.body.code)

  return <DocsLayout doc={doc}>{mdx}</DocsLayout>
}
