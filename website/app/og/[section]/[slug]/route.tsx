import { type DataAttrDocKey, getDataAttrDoc } from "@zag-js/docs"
import { renderOgImage } from "lib/og-image"
import { components, guides, overviews, posts, utilities } from "lib/source"

const sections = {
  overview: { label: "Overview", docs: overviews },
  guides: { label: "Developer", docs: guides },
  components: { label: "Components", docs: components },
  utilities: { label: "Utilities", docs: utilities },
  blog: { label: "Blog", docs: posts },
}

function getSelectors(slug: string) {
  let doc: Record<string, Record<string, string>>
  try {
    doc = getDataAttrDoc(slug as DataAttrDocKey)
  } catch {
    return undefined
  }
  const attrs = doc.Trigger ?? doc.Root ?? Object.values(doc)[0]
  if (!attrs) return undefined
  const entries = Object.entries(attrs)
  const part = entries.find(([name]) => name.startsWith(`data-${slug}-`))
  const state =
    entries.find(([name]) => name === "data-state") ??
    entries.find(([, desc]) => desc.startsWith("Present when"))
  const value = state?.[1].match(/"([^"]+)"/)?.[1]
  return [
    part && `[${part[0]}]`,
    state && (value ? `[${state[0]}="${value}"]` : `[${state[0]}]`),
  ].filter((line): line is string => !!line)
}

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return Object.entries(sections).flatMap(([section, { docs }]) =>
    docs.map((doc) => ({ section, slug: `${doc.slug}.png` })),
  )
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ section: string; slug: string }> },
) {
  const { section, slug } = await context.params
  const entry = sections[section as keyof typeof sections]
  const doc = entry?.docs.find((doc) => `${doc.slug}.png` === slug)
  if (!entry || !doc) return new Response("Not found", { status: 404 })
  return renderOgImage({
    section: entry.label,
    title: doc.title,
    description: doc.description,
    code: section === "components" ? getSelectors(doc.slug) : undefined,
    footer: `zagjs.com/${section}/${doc.slug}`,
  })
}
