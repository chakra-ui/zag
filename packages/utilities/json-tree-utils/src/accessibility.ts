import { getNodeTypeDescription } from "./data-type"
import { keyPathToKey } from "./node-conversion"
import { type JsonNode, type JsonNodePreviewOptions } from "./types"

const propertyWord = (count: number) => (count === 1 ? "property" : "properties")

const isPrimitive = (node: JsonNode) => {
  return node.type === "string" || node.type === "number" || node.type === "boolean"
}

export const getAccessibleDescription = (node: JsonNode, opts?: JsonNodePreviewOptions): string => {
  const typeDescription = getNodeTypeDescription(node, opts)

  const key = keyPathToKey(node.keyPath, { excludeRoot: true })
  const nonEnumerablePrefix = node.isNonEnumerable ? "non-enumerable " : ""
  const format = (text: string) => {
    return [key, `${nonEnumerablePrefix}${text}`].filter(Boolean).join(": ")
  }

  // For expandable nodes, include child count
  if (node.children && node.children.length > 0) {
    const childCount = node.children.length

    if (key === "[[Entries]]") {
      return format(`${childCount} ${propertyWord(childCount)}`)
    }

    return format(`${typeDescription}, expandable with ${childCount} ${propertyWord(childCount)}`)
  }

  // For leaf nodes, include the actual value for primitives
  if (isPrimitive(node)) {
    if (key === "stack") {
      return format(node.value.split("\n")[1]?.trim() || "trace")
    }

    if (key === "[[Function]]") {
      return format("function implementation")
    }

    const value = typeof node.value === "string" ? `"${node.value}"` : String(node.value)
    const info =
      node.isNonEnumerable && node.propertyDescriptor ? `, ${getDescriptorInfo(node.propertyDescriptor)}` : ""
    return format(`${value}${info}`)
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

  // For other leaf nodes, just use type description
  const info = node.isNonEnumerable && node.propertyDescriptor ? `, ${getDescriptorInfo(node.propertyDescriptor)}` : ""
  return format(`${nonEnumerablePrefix}${typeDescription}${info}`)
}

const getDescriptorInfo = (descriptor: PropertyDescriptor): string => {
  const parts: string[] = []
  if (!descriptor.writable) parts.push("read-only")
  if (!descriptor.configurable) parts.push("non-configurable")
  return parts.length > 0 ? parts.join(", ") : "non-enumerable"
}
