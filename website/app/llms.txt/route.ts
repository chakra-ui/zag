import { frameworks } from "lib/framework-utils"
import { formatUrl } from "lib/pagination-utils"
import sidebar from "../../sidebar.config"

function formatDocItem(categoryId: string, docItem: any, framework?: string) {
  const href = formatUrl(categoryId, docItem.id, framework)
  return `- [${docItem.label}](https://zagjs.com${href})`
}

function formatCategory(category: any) {
  const header = `# ${category.label}\n`

  if (category.id === "components") {
    const itemsPerFramework = Object.entries(frameworks).map(
      ([framework, { label }]) => {
        const items = category.items
          .map((item: any) =>
            item.type === "doc"
              ? formatDocItem(category.id, item, framework)
              : "",
          )
          .filter(Boolean)
        return `\n## ${label}\n\n${items.join("\n")}`
      },
    )
    return `${header}${itemsPerFramework.join("\n\n")}`
  }

  const items = category.items
    .map((item: any) =>
      item.type === "doc" ? formatDocItem(category.id, item) : "",
    )
    .filter(Boolean)
  return `${header}\n${items.join("\n")}`
}

export function GET() {
  const text = sidebar.docs
    .map((item) => (item.type === "category" ? formatCategory(item) : ""))
    .filter(Boolean)
    .join("\n\n")

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
