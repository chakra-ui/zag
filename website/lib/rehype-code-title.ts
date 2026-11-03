import { visit } from "unist-util-visit"

/**
 * Reads a code block's title from its fence and puts it on the `pre` as `data-title`:
 * ```tsx title="slider.tsx"``` or ```tsx filename="slider.tsx"``` (```tsx:slider.tsx``` still works)
 */
export function rehypeCodeTitle() {
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (node.tagName !== "pre") return
      const code = node.children?.find((child: any) => child.tagName === "code")
      if (!code) return

      const meta: string = code.data?.meta ?? code.properties?.metastring ?? ""
      let title = meta
        .match(/(?:title|filename)=(?:"([^"]+)"|'([^']+)'|(\S+))/)
        ?.slice(1)
        .find(Boolean)

      const classes: string[] = code.properties?.className ?? []
      code.properties.className = classes.map((name) => {
        const [lang, inlineTitle] = name.split(":")
        if (inlineTitle && name.startsWith("language-")) {
          title ??= inlineTitle
          return lang
        }
        return name
      })

      if (title) node.properties = { ...node.properties, dataTitle: title }
    })
  }
}
