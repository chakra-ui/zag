import sidebar from "sidebar.config"
import { components as allComponents, getOverviewDoc } from "./source"
import { frameworks } from "./framework-utils"
import { expandComponentContent } from "./mdx-expansion"

export function transformComponentDoc(itemId: string, framework?: string) {
  const comp = allComponents.find((c) => c.slug === itemId)
  if (!comp) return ""
  const content = comp.body.raw
  if (!content) return ""
  return expandComponentContent(content, comp, framework)
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
