import { jsonNodeToElement, keyPathToKey, type JsonNode, type JsonNodeHastElement } from "../../src/json-tree"

export const elementText = (element: JsonNodeHastElement): string =>
  element.type === "text" ? String(element.value) : element.children.map(elementText).join("")

/** One line per node, indented by depth: `key type preview`, with `(hidden)` for non-enumerable properties */
export function printTree(node: JsonNode, maxDepth = Infinity): string {
  const lines: string[] = []
  const visit = (current: JsonNode, depth: number) => {
    const key = keyPathToKey(current.keyPath) || "(root)"
    const hidden = current.isNonEnumerable ? " (hidden)" : ""
    lines.push(`${"  ".repeat(depth)}${key}: ${current.type}${hidden}  ${elementText(jsonNodeToElement(current))}`)
    if (depth < maxDepth) current.children?.forEach((child) => visit(child, depth + 1))
  }
  visit(node, 0)
  return lines.join("\n")
}
