"use client"

import type { Component } from ".velite"
import { FrameworkProvider } from "components/framework"
import { useMDX } from "components/mdx-components"
import DocsLayout from "../../docs-layout"
import type { Framework } from "lib/framework-utils"

type ComponentPageClientProps = {
  doc: Component
  framework: Framework
}

export default function ComponentPageClient({
  doc,
  framework,
}: ComponentPageClientProps) {
  const mdx = useMDX(doc.body.code)

  return (
    <FrameworkProvider value={framework}>
      <DocsLayout doc={doc}>{mdx}</DocsLayout>
    </FrameworkProvider>
  )
}
