import { components as allComponents, snippets as allSnippets } from ".velite"
import sidebar from "sidebar.config"
import { getOverviewDoc } from "./contentlayer-utils"
import { frameworks } from "./framework-utils"
import {
  expandResources,
  expandApiTable,
  expandContextTable,
  expandKeyboardTable,
  expandDataAttrTable,
  removeComponents,
} from "./mdx-expansion"

export function transformComponentDoc(itemId: string, framework?: string) {
  const comp = allComponents.find((c) => c.slug === itemId)
  if (!comp) return ""
  let content = comp.body.raw
  if (!content) return ""

  // Apply all expansions
  content = expandResources(content, comp)
  content = expandApiTable(content, itemId)
  content = expandContextTable(content, itemId)
  content = expandKeyboardTable(content, itemId)
  content = expandDataAttrTable(content, itemId)
  content = removeComponents(content)

  // Add CodeSnippets for specific framework (different from API route which shows all)
  content = content.replace(
    /<CodeSnippet\s+id="([^"]*)"\s*\/>/g,
    (_: string, id: string) => {
      const snippet = allSnippets.find((s) => {
        const [_, __, ...rest] = s.params
        const str = rest.join("/") + ".mdx"
        return str === id && s.framework === framework
      })

      return snippet?.body.raw ?? ""
    },
  )

  return content
}

export function getComponentsPerFramework(framework: string) {
  return sidebar.docs
    .map((item) => {
      if (item.type === "category" && item.id === "components") {
        return item.items
          .map((item) => {
            if (item.type === "doc") {
              return transformComponentDoc(item.id, framework)
            }
            return ""
          })
          .filter(Boolean)
          .join("\n\n")
      }
      return ""
    })
    .filter(Boolean)
    .join("\n\n")
}

function formatDocItemForFull(
  categoryId: string,
  docItem: any,
  framework?: string,
) {
  if (categoryId === "components") {
    const content = transformComponentDoc(docItem.id, framework)
    return content
  }

  const doc = getOverviewDoc(docItem.id)
  const content = doc?.body.raw
  return content
}

function formatCategoryForFull(category: any) {
  if (category.id === "components") {
    const itemsPerFramework = Object.entries(frameworks).map(
      ([framework, { label }]) => {
        const items = category.items
          .map((item: any) =>
            item.type === "doc"
              ? formatDocItemForFull(category.id, item, framework)
              : "",
          )
          .filter(Boolean)
        return `\n## ${label}\n\n${items.join("\n")}`
      },
    )
    return itemsPerFramework.join("\n\n")
  }

  const items = category.items
    .map((item: any) =>
      item.type === "doc" ? formatDocItemForFull(category.id, item) : "",
    )
    .filter(Boolean)

  return items.join("\n")
}

export function getFullComponentsText() {
  return sidebar.docs
    .map((item) =>
      item.type === "category" ? formatCategoryForFull(item) : "",
    )
    .filter(Boolean)
    .join("\n\n")
}
