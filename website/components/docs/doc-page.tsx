import DocsLayout from "app/(docs)/docs-layout"
import type { Framework } from "lib/framework-utils"
import { getBody, type Doc } from "lib/source"
import { notFound } from "next/navigation"
import { FrameworkProvider } from "./framework"
import { absoluteUrl, JsonLd } from "../json-ld"
import { mdxComponents } from "./mdx-components"

interface DocPageProps {
  category: "overview" | "guides" | "components" | "utilities"
  doc: Doc | undefined
  /** set when the URL names a framework */
  framework?: Framework
}

// sections with an index page get a breadcrumb; a crumb needs a URL
const sectionCrumbs: Partial<Record<DocPageProps["category"], Crumb>> = {
  components: { name: "Components", url: "/overview/components" },
  utilities: { name: "Utilities", url: "/overview/utilities" },
}

type Crumb = { name: string; url: string }

export function DocPage({ category, doc, framework }: DocPageProps) {
  if (!doc) notFound()
  const Body = getBody(category, doc.slug)
  const url = absoluteUrl(`/${category}/${doc.slug}`)
  return (
    <FrameworkProvider value={framework}>
      <JsonLd
        data={{
          "@graph": [
            {
              "@type": "TechArticle",
              headline: doc.title,
              description: doc.description,
              url,
              image: absoluteUrl(`/og/${category}/${doc.slug}.png`),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { name: "Zag", url: "/" },
                sectionCrumbs[category],
                { name: doc.title, url: `/${category}/${doc.slug}` },
              ]
                .filter((crumb) => crumb !== undefined)
                .map((crumb, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: crumb.name,
                  item: absoluteUrl(crumb.url),
                })),
            },
          ],
        }}
      />
      <DocsLayout doc={doc}>
        {Body ? <Body components={mdxComponents} /> : null}
      </DocsLayout>
    </FrameworkProvider>
  )
}
