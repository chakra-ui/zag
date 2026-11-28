import { getDataType, PrimitiveType } from "./data-type"
import { getPreviewOptions, ROOT_KEY } from "./node-conversion"
import type { JsonNode, JsonNodeKeyPath, JsonNodePreviewOptions } from "./types"

export interface JsonToTreeOptions {
  /** Objects on the path to this value, for spotting cycles */
  visited?: WeakSet<WeakKey> | undefined
  /** Where the value sits in the tree */
  keyPath?: JsonNodeKeyPath | undefined
  options?: JsonNodePreviewOptions | undefined
  /** How deep the value already is */
  depth?: number | undefined
}

// deeper values show as a placeholder, so a huge or self-similar structure can't overflow the stack
const MAX_DEPTH = 20

/** Converts a value into a tree of nodes, one per property, entry or item */
export const jsonToTree = (data: unknown, props: JsonToTreeOptions = {}): JsonNode => {
  const { visited = new WeakSet(), keyPath = [ROOT_KEY], depth = 0 } = props
  return createNode(data, visited, keyPath, getPreviewOptions(props.options), depth)
}

const createNode = (
  data: unknown,
  visited: WeakSet<WeakKey>,
  keyPath: JsonNodeKeyPath,
  options: JsonNodePreviewOptions,
  depth: number,
): JsonNode => {
  if (depth > MAX_DEPTH) {
    return {
      value: "[Max Depth Reached]",
      type: "string",
      keyPath,
    }
  }

  const isObject = !!data && typeof data === "object"
  if (isObject) {
    if (visited.has(data)) {
      return {
        value: "[Circular Reference]",
        type: "circular",
        keyPath,
      }
    }
    visited.add(data)
  }

  const dataType = getDataType(data) || PrimitiveType
  const node = dataType.node({
    value: data,
    createNode: (nestedKeyPath: JsonNodeKeyPath, value: unknown) =>
      createNode(value, visited, [...keyPath, ...nestedKeyPath], options, depth + 1),
    keyPath,
    options,
  })

  // only ancestors count as circular; the same object can appear again in a sibling branch
  if (isObject) visited.delete(data)
  return node
}
