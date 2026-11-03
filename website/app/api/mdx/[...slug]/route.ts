import { docStaticParams, resolveDoc } from "lib/doc-content"
import { NextRequest, NextResponse } from "next/server"

// Every docs page is known at build time, so "Copy page" reads a static file
export const dynamic = "force-static"

export function generateStaticParams() {
  return docStaticParams()
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await context.params

  if (!slug || slug.length === 0) {
    return NextResponse.json({ error: "No slug provided" }, { status: 400 })
  }

  const resolved = resolveDoc(slug)

  if (!resolved) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 })
  }

  const { doc, contentType, framework, content } = resolved

  // Return the page data
  const response = {
    // Core fields
    slug: doc.slug,
    title: doc.title || doc.frontmatter?.title,
    description: doc.description || doc.frontmatter?.description,
    contentType,
    framework, // Include the framework if specified

    // Content with expanded snippets
    content,
    html: doc.body?.html || doc.html,

    // Package info
    package: doc.package || doc.frontmatter?.package,

    // URLs
    editUrl: doc.editUrl,
    permalink: doc.permalink,
  }

  return NextResponse.json(response, {
    headers: { "X-Robots-Tag": "noindex" },
  })
}
