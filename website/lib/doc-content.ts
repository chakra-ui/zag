import {
  components,
  getComponentPaths,
  guides,
  overviews,
  snippets,
  utilities,
} from "lib/source"
import { expandComponentContent } from "lib/mdx-expansion"

export function docStaticParams() {
  return [
    ...getComponentPaths().map(({ params }) => ({
      slug: ["components", ...params.slug],
    })),
    ...overviews.map((doc) => ({ slug: ["overview", doc.slug] })),
    ...guides.map((doc) => ({ slug: ["guides", doc.slug] })),
    ...utilities.map((doc) => ({ slug: ["utilities", doc.slug] })),
  ]
}

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
    findBy: (d, slug) => d.key === slug,
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

/** `["components", "react", "dialog"]` -> the page, its framework and its expanded markdown */
export function resolveDoc(slug: string[]) {
  const category = slug[0]
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

  const { doc, contentType } = findDocument(category, rest.join("/"))
  if (!doc) return null

  // Get the raw content
  let content = doc.body?.raw || doc.raw || doc.content || ""

  // Expand component content (CodeSnippets, ApiTable, ContextTable, etc.) if content type is component
  if (contentType === "component" && content) {
    const componentId = doc.slug // The slug is the component ID (e.g., "accordion", "dialog", etc.)
    content = expandComponentContent(content, componentId, doc, framework)
  }

  return { doc, contentType, framework, content: content as string }
}
