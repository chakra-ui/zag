import { frameworks } from "lib/framework-utils"
import type { GetServerSideProps } from "next"
import sidebar from "sidebar.config"
import { getOverviewDoc } from "lib/contentlayer-utils"
import { transformComponentDoc } from "lib/component-llm"

function formatDocItem(categoryId: string, docItem: any, framework?: string) {
  if (categoryId === "components") {
    const content = transformComponentDoc(docItem.id, framework)
    return content
  }

  const doc = getOverviewDoc(docItem.id)
  const content = doc?.body.raw
  return content
}

function formatCategory(category: any) {
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
    return itemsPerFramework.join("\n\n")
  }

  const items = category.items
    .map((item: any) =>
      item.type === "doc" ? formatDocItem(category.id, item) : "",
    )
    .filter(Boolean)

  return items.join("\n")
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "text/plain")

  const text = sidebar.docs
    .map((item) => (item.type === "category" ? formatCategory(item) : ""))
    .filter(Boolean)
    .join("\n\n")

  res.write(text)
  res.end()

  return {
    props: {},
  }
}

export default function LLMsFullText() {
  return null
}
