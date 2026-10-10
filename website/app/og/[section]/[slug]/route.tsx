import { renderOgImage } from "lib/og-image"
import { components, guides, overviews, utilities } from "lib/source"

const sections = {
  overview: { label: "Overview", docs: overviews },
  guides: { label: "Guides", docs: guides },
  components: { label: "Components", docs: components },
  utilities: { label: "Utilities", docs: utilities },
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
  })
}
