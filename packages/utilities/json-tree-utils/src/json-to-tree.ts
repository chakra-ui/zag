import { dataTypes, PrimitiveType } from "./data-type"
import { getPreviewOptions, ROOT_KEY } from "./node-conversion"
import type { JsonNode, JsonNodePreviewOptions } from "./types"

export interface JsonToTreeOptions {
  visited?: WeakSet<WeakKey> | undefined
  keyPath?: (string | number)[] | undefined
  options?: JsonNodePreviewOptions | undefined
  depth?: number | undefined
}

const MAX_DEPTH = 20

export const jsonToTree = (data: unknown, props: JsonToTreeOptions = {}): JsonNode => {
  const { visited = new WeakSet(), keyPath = [ROOT_KEY], depth = 0 } = props
  const options = getPreviewOptions(props.options)

  // Prevent infinite recursion by limiting depth
  if (depth > MAX_DEPTH) {
    return {
      value: "[Max Depth Reached]",
      type: "string",
      keyPath,
    }
  }

  if (data && typeof data === "object") {
    if (visited.has(data)) {
      return {
        value: "[Circular Reference]",
        type: "circular",
        keyPath,
      }
    }
    visited.add(data)
  }

  const dataType = dataTypes.find((dataType) => dataType.check(data)) || PrimitiveType
  return dataType.node({
    value: data,
    createNode: (nestedKeyPath, value) =>
      jsonToTree(value, {
        visited,
        keyPath: [...keyPath, ...nestedKeyPath],
        options,
        depth: depth + 1,
      }),
    keyPath,
    options,
  })
}
