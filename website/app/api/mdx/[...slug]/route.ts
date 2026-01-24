import { components, guides, overviews, snippets, utilities } from ".velite"
import { expandComponentContent } from "lib/mdx-expansion"
import { NextRequest, NextResponse } from "next/server"

// Default finder function for most collections
const defaultFindBy = (d: any, slug: string) => d.slug === slug

// Define collection mappings for cleaner lookups
const collections: Record<
  string,
  {
    data: any[]
    findBy?: (d: any, slug: string) => boolean
  }
> = {
  overview: { data: overviews },
  components: { data: components },
  guides: { data: guides },
  utilities: { data: utilities },
  snippets: {
    data: snippets,
    findBy: (d, slug) => d.frontmatter?.slug === `/snippets/${slug}`,
  },
}

type CollectionType = keyof typeof collections

function findDocument(category: string, slug: string) {
  // First, try to find in the specified category
  const collection = collections[category as CollectionType]
  if (collection) {
    const findBy = collection.findBy || defaultFindBy
    const doc = collection.data.find((d) => findBy(d, slug))
    if (doc) {
      return {
        doc,
        contentType:
          category === "components" ? "component" : (category as string),
      }
    }
  }

  // If not found or invalid category, search all collections using the category as the slug
  for (const [type, collection] of Object.entries(collections)) {
    if (type === "snippets") continue // Skip snippets for direct slug search

    const findBy = collection.findBy || defaultFindBy
    const doc = collection.data.find((d) => findBy(d, category))
    if (doc) {
      return { doc, contentType: type === "components" ? "component" : type }
    }
  }

  return { doc: null, contentType: null }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await context.params

  if (!slug || slug.length === 0) {
    return NextResponse.json({ error: "No slug provided" }, { status: 400 })
  }

  let category = slug[0]
  let rest = slug.slice(1)
  let framework: string | undefined

  // Check if the path is like /components/react/avatar
  // If second segment is a framework, extract it
  if (category === "components" && rest.length >= 2) {
    const possibleFramework = rest[0]
    if (["react", "vue", "solid", "svelte"].includes(possibleFramework)) {
      framework = possibleFramework
      rest = rest.slice(1) // Remove framework from the path
    }
  }

  const searchSlug = rest.join("/")
  const { doc, contentType } = findDocument(category, searchSlug)

  if (!doc) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 })
  }

  // Get the raw content
  let rawContent = doc.body?.raw || doc.raw || doc.content || ""

  // Expand component content (CodeSnippets, ApiTable, ContextTable, etc.) if content type is component
  if (contentType === "component" && rawContent) {
    const componentId = doc.slug // The slug is the component ID (e.g., "accordion", "dialog", etc.)
    rawContent = expandComponentContent(rawContent, componentId, doc, framework)
  }

  // Return all available data from velite
  const response = {
    // Core fields
    slug: doc.slug,
    title: doc.title || doc.frontmatter?.title,
    description: doc.description || doc.frontmatter?.description,
    contentType,
    framework, // Include the framework if specified

    // Content with expanded snippets
    content: rawContent,
    html: doc.body?.html || doc.html,

    // Package info
    package: doc.package || doc.frontmatter?.package,

    // URLs
    editUrl: doc.editUrl,
    permalink: doc.permalink,
  }

  return NextResponse.json(response)
}
