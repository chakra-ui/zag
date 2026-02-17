import { snippets } from ".velite"
import apiJson, {
  getAccessibilityDoc,
  getDataAttrDoc,
  type AccessibilityDocKey,
  type DataAttrDocKey,
} from "@zag-js/docs"

/**
 * Expands CodeSnippet components with actual code for all frameworks or a specific framework
 */
const CODE_SNIPPET_REGEX = /<CodeSnippet\s+id="([^"]*)"\s*\/>/g

export function expandCodeSnippets(
  content: string,
  framework?: string,
): string {
  return content.replace(CODE_SNIPPET_REGEX, (_: string, id: string) => {
    // If a specific framework is requested, only show that one
    const frameworks = framework
      ? [framework]
      : ["react", "solid", "vue", "svelte"]

    const expandedSnippets = frameworks
      .map((fw) => {
        const snippet = snippets.find((s) => {
          const [_, __, ...rest] = s.params
          const str = rest.join("/") + ".mdx"
          return str === id && s.framework === fw
        })

        if (snippet?.body.raw) {
          // Only show framework header if showing multiple frameworks
          return framework
            ? snippet.body.raw
            : `**${fw.charAt(0).toUpperCase() + fw.slice(1)}**\n\n${snippet.body.raw}`
        }
        return null
      })
      .filter(Boolean)

    return expandedSnippets.join("\n\n") || ""
  })
}

/**
 * Expands ApiTable components with API documentation
 */
const API_TABLE_REGEX = /<ApiTable\s+name="[^"]*"\s*\/>/g

export function expandApiTable(content: string, componentId: string): string {
  if (!(componentId in apiJson)) return content

  const apiItems = Object.entries(
    apiJson[componentId as keyof typeof apiJson].api,
  )
    .map(([key, item]) => {
      return [
        `**\`${key}\`**`,
        `Type: \`${item.type}\``,
        `Description: ${item.description}`,
      ].join("\n")
    })
    .join("\n\n")

  return content.replace(API_TABLE_REGEX, apiItems)
}

/**
 * Expands ContextTable components with context documentation
 */
const CONTEXT_TABLE_REGEX = /<ContextTable\s+name="[^"]*"\s*\/>/g

export function expandContextTable(
  content: string,
  componentId: string,
): string {
  if (!(componentId in apiJson)) return content

  const contextItems = Object.entries(
    apiJson[componentId as keyof typeof apiJson].context,
  )
    .map(([key, item]) => {
      return [
        `**\`${key}\`**`,
        `Type: \`${item.type}\``,
        `Description: ${item.description}`,
      ].join("\n")
    })
    .join("\n\n")

  return content.replace(CONTEXT_TABLE_REGEX, contextItems)
}

/**
 * Expands KeyboardTable components with keyboard shortcuts documentation
 */
const KEYBOARD_TABLE_REGEX = /<KeyboardTable\s+name="[^"]*"\s*\/>/g

export function expandKeyboardTable(
  content: string,
  componentId: string,
): string {
  try {
    const keyboardDoc = getAccessibilityDoc(componentId as AccessibilityDocKey)
    const keyboardItems = keyboardDoc.keyboard
      .map((item) => {
        return [
          `**\`${item.keys.join(" + ")}\`**`,
          `Description: ${item.description}`,
        ].join("\n")
      })
      .join("\n\n")

    return content.replace(KEYBOARD_TABLE_REGEX, keyboardItems)
  } catch {
    // Component may not have keyboard interactions
    return content
  }
}

/**
 * Expands DataAttrTable components with data attributes documentation
 */
const DATA_ATTR_TABLE_REGEX = /<DataAttrTable\s+name="[^"]*"\s*\/>/g

export function expandDataAttrTable(
  content: string,
  componentId: string,
): string {
  try {
    const dataAttrDoc = getDataAttrDoc(componentId as DataAttrDocKey)
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

    return content.replace(DATA_ATTR_TABLE_REGEX, dataAttrItems)
  } catch {
    // Component may not have data attributes
    return content
  }
}

/**
 * Removes specific MDX components from content
 */
const SHOWCASE_REGEX = /<Showcase\s+id="[^"]*"\s*\/>/g
const ANATOMY_REGEX = /<Anatomy\s+id="[^"]*"\s*\/>/g

export function removeComponents(content: string): string {
  content = content.replace(SHOWCASE_REGEX, "")
  content = content.replace(ANATOMY_REGEX, "")
  return content
}

/**
 * Expands Resources component with links
 */
const RESOURCES_REGEX = /<Resources\s+pkg="[^"]*"\s*\/>/g

export function expandResources(content: string, component: any): string {
  const resources = [
    "## Resources\n\n",
    `[Latest version: v${component.version}](${component.npmUrl})`,
    `[Logic Visualizer](${component.visualizeUrl})`,
    `[Source Code](${component.sourceUrl})`,
  ].join("\n")

  return content.replace(RESOURCES_REGEX, resources)
}

/**
 * Expands all component-specific MDX components in the content
 */
export function expandComponentContent(
  content: string,
  componentId: string,
  component?: any,
  framework?: string,
): string {
  // Expand all the various MDX components
  content = expandCodeSnippets(content, framework)
  content = expandApiTable(content, componentId)
  content = expandContextTable(content, componentId)
  content = expandKeyboardTable(content, componentId)
  content = expandDataAttrTable(content, componentId)
  content = removeComponents(content)

  // Expand resources if component data is provided
  if (component) {
    content = expandResources(content, component)
  }

  return content
}
