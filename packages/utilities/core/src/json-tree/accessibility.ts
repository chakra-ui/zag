import { getNodeTypeDescription } from "./data-type"
import { keyPathToKey } from "./node-conversion"
import { type JsonNode, type JsonNodePreviewOptions } from "./types"

const propertyWord = (count: number) => (count === 1 ? "property" : "properties")

const isPrimitive = (node: JsonNode) => node.type === "string" || node.type === "number" || node.type === "boolean"

/** What a screen reader announces for a node: its key, its type or value, and how many children it has */
export const getAccessibleDescription = (node: JsonNode, opts?: JsonNodePreviewOptions): string => {
  const typeDescription = getNodeTypeDescription(node, opts)

  const key = keyPathToKey(node.keyPath, { excludeRoot: true })
  const nonEnumerablePrefix = node.isNonEnumerable ? "non-enumerable " : ""
  const format = (text: string) => [key, `${nonEnumerablePrefix}${text}`].filter(Boolean).join(": ")

  if (node.children && node.children.length > 0) {
    const childCount = node.children.length

    if (key === "[[Entries]]") {
      return format(`${childCount} ${propertyWord(childCount)}`)
    }

    return format(`${typeDescription}, expandable with ${childCount} ${propertyWord(childCount)}`)
  }

  if (isPrimitive(node)) {
    if (key === "stack") {
      return format(node.value.split("\n")[1]?.trim() || "trace")
    }

    if (key === "[[Function]]") {
      return format("function implementation")
    }

    const value = typeof node.value === "string" ? `"${node.value}"` : String(node.value)
    return format(`${value}${getDescriptorInfo(node)}`)
  }

  if (node.type === "null") {
    return format("null")
  }

  if (node.type === "undefined") {
    return format("undefined")
  }

  if (node.type === "circular") {
    return format("circular reference")
  }

  return format(`${typeDescription}${getDescriptorInfo(node)}`)
}

// how a hidden property can't be changed; "non-enumerable" is already in the label
function getDescriptorInfo(node: JsonNode): string {
  const descriptor = node.isNonEnumerable ? node.propertyDescriptor : undefined
  if (!descriptor) return ""
  const parts: string[] = []
  if (!descriptor.writable) parts.push("read-only")
  if (!descriptor.configurable) parts.push("non-configurable")
  return parts.length > 0 ? `, ${parts.join(", ")}` : ""
}
