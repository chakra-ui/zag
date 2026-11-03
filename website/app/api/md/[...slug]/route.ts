import { docStaticParams, resolveDoc } from "lib/doc-content"

// Served at `/<page>.md` and for `Accept: text/markdown` (see rewrites in next.config.mjs)
export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return docStaticParams()
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await context.params
  const resolved = resolveDoc(slug)

  if (!resolved) {
    return new Response("Not found", { status: 404 })
  }

  const { doc, content } = resolved
  const text = `# ${doc.title}\n\n> ${doc.description}\n\n${content.trim()}\n`

  return new Response(text, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  })
}
