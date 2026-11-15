import siteConfig from "site.config"
import { snippets } from "./source"
import apiJson, {
  getAccessibilityDoc,
  getCssVarDoc,
  getDataAttrDoc,
  type AccessibilityDocKey,
  type CssVarDocKey,
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
        const snippet = snippets.find((s) => s.id === id && s.framework === fw)

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

const formatProps = (
  props: Record<string, { type: string; description: string }>,
) =>
  Object.entries(props)
    .map(([key, item]) =>
      [
        `**\`${key}\`**`,
        `Type: \`${item.type}\``,
        `Description: ${item.description}`,
      ].join("\n"),
    )
    .join("\n\n")

const formatGroupedDoc = (doc: Record<string, Record<string, string>>) =>
  Object.entries(doc)
    .map(([part, items]) =>
      [
        `**\`${part}\`**`,
        Object.entries(items)
          .map(([key, value]) => `**\`${key}\`**: ${value}`)
          .join("\n"),
      ].join("\n\n"),
    )
    .join("\n\n")

const formatKeyboard = (name: string) =>
  getAccessibilityDoc(name as AccessibilityDocKey)
    .keyboard.map((item) =>
      [
        `**\`${item.keys.join(" + ")}\`**`,
        `Description: ${item.description}`,
      ].join("\n"),
    )
    .join("\n\n")

const tables: Record<string, (name: string) => string> = {
  ApiTable: (name) => formatProps(apiJson[name as keyof typeof apiJson].api),
  ContextTable: (name) =>
    formatProps(apiJson[name as keyof typeof apiJson].context),
  KeyboardTable: formatKeyboard,
  DataAttrTable: (name) =>
    formatGroupedDoc(getDataAttrDoc(name as DataAttrDocKey)),
  CssVarTable: (name) => formatGroupedDoc(getCssVarDoc(name as CssVarDocKey)),
}

const TABLE_REGEX =
  /<(ApiTable|ContextTable|KeyboardTable|DataAttrTable|CssVarTable)\s+name="([^"]*)"\s*\/>/g

/** Expands each doc table tag using the machine named in the tag; a missing doc renders nothing */
export function expandTables(content: string): string {
  return content.replace(TABLE_REGEX, (_, tag: string, name: string) => {
    try {
      return tables[tag](name)
    } catch {
      return ""
    }
  })
}

/**
 * Removes specific MDX components from content
 */
const SHOWCASE_REGEX = /<Showcase\s+id="[^"]*"\s*\/>/g
const ANATOMY_REGEX = /<Anatomy\s+id="[^"]*"\s*\/>/g
// keeps the code inside, drops the live-demo wrapper
const EXAMPLE_TAG_REGEX = /^<\/?Example\b[^>]*>\n?/gm

export function removeComponents(content: string): string {
  content = content.replace(SHOWCASE_REGEX, "")
  content = content.replace(ANATOMY_REGEX, "")
  content = content.replace(EXAMPLE_TAG_REGEX, "")
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
    component.logicUrl
      ? `[Machine logic (JSON)](${siteConfig.url}${component.logicUrl})`
      : "",
    `[Source Code](${component.sourceUrl})`,
  ]
    .filter(Boolean)
    .join("\n")

  return content.replace(RESOURCES_REGEX, resources)
}

/**
 * Expands all component-specific MDX components in the content
 */
export function expandComponentContent(
  content: string,
  component?: any,
  framework?: string,
): string {
  // Expand all the various MDX components
  content = expandCodeSnippets(content, framework)
  content = expandTables(content)
  content = removeComponents(content)

  // Expand resources if component data is provided
  if (component) {
    content = expandResources(content, component)
  }

  return content
}
