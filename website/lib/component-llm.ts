import { allComponents, allSnippets } from "@/contentlayer"
import sidebar from "sidebar.config"
import apiJson, {
  getAccessibilityDoc,
  type AccessibilityDocKey,
  getDataAttrDoc,
  type DataAttrDocKey,
} from "@zag-js/docs"

export function transformComponentDoc(itemId: string, framework?: string) {
  const comp = allComponents.find((c) => c.slug === itemId)
  if (!comp) return ""
  let content = comp.body.raw
  if (!content) return ""

  // Remove Showcase
  content = content.replace(/<Showcase\s+id="[^"]*"\s*\/>/g, "")

  // Add Resources
  const resources = [
    "## Resources\n\n",
    `[Latest version: v${comp.version}](${comp.npmUrl})`,
    `[Logic Visualizer](${comp.visualizeUrl})`,
    `[Source Code](${comp.sourceUrl})`,
  ]
  content = content.replace(
    /<Resources\s+pkg="[^"]*"\s*\/>/g,
    resources.join("\n"),
  )

  // Add ApiTable
  const apiItems =
    itemId in apiJson
      ? Object.entries(apiJson[itemId as keyof typeof apiJson].api)
          .map(([key, item]) => {
            return [
              `**\`${key}\`**`,
              `Type: \`${item.type}\``,
              `Description: ${item.description}`,
            ].join("\n")
          })
          .join("\n\n")
      : ""
  content = content.replace(/<ApiTable\s+name="[^"]*"\s*\/>/g, apiItems)

  // Add KeyboardTable
  try {
    const keyboardDoc = getAccessibilityDoc(itemId as AccessibilityDocKey)
    const keyboardItems = keyboardDoc.keyboard
      .map((item) => {
        return [
          `**\`${item.keys.join(" + ")}\`**`,
          `Description: ${item.description}`,
        ].join("\n")
      })
      .join("\n\n")
    content = content.replace(
      /<KeyboardTable\s+name="[^"]*"\s*\/>/g,
      keyboardItems,
    )
  } catch {}

  // Add DataAttrTable
  try {
    const dataAttrDoc = getDataAttrDoc(itemId as DataAttrDocKey)
    const dataAttrItems = Object.entries(dataAttrDoc)
      .map(([part, attrs]) => {
        return [
          `**\`${part}\`**`,
          Object.entries(attrs)
            .map(([key, value]) => {
              return `**\`${key}\`**: ${value}`
            })
            .join("\n"),
        ].join("\n\n")
      })
      .join("\n\n")
    content = content.replace(
      /<DataAttrTable\s+name="[^"]*"\s*\/>/g,
      dataAttrItems,
    )
  } catch {}

  // Add ContextTable
  const contextItems =
    itemId in apiJson
      ? Object.entries(apiJson[itemId as keyof typeof apiJson].context)
          .map(([key, item]) => {
            return [
              `**\`${key}\`**`,
              `Type: \`${item.type}\``,
              `Description: ${item.description}`,
            ].join("\n")
          })
          .join("\n\n")
      : ""
  content = content.replace(/<ContextTable\s+name="[^"]*"\s*\/>/g, contextItems)

  // Remove Anatomy
  content = content.replace(/<Anatomy\s+id="[^"]*"\s*\/>/g, "")

  // Add CodeSnippets
  content = content.replace(/<CodeSnippet\s+id="([^"]*)"\s*\/>/g, (_, id) => {
    const snippet = allSnippets.find((s) => {
      const [_, __, ...rest] = s.params
      const str = rest.join("/") + ".mdx"
      return str === id && s.framework === framework
    })

    return snippet?.body.raw ?? ""
  })

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
