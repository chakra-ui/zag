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
  // dynamicParams = false: only prerendered pages reach here, so the doc exists
  const { doc, content } = resolveDoc(slug)!
  const text = `# ${doc.title}\n\n> ${doc.description}\n\n${content.trim()}\n`

  return new Response(text, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  })
}
