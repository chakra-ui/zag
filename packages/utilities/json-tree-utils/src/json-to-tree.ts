import { dataTypes, PrimitiveType } from "./data-type"
import { getPreviewOptions, ROOT_KEY } from "./node-conversion"
import type { JsonNode, JsonNodePreviewOptions } from "./types"

export interface JsonToTreeOptions {
  visited?: WeakSet<WeakKey> | undefined
  keyPath?: (string | number)[] | undefined
  options?: JsonNodePreviewOptions | undefined
}

export const jsonToTree = (data: unknown, props: JsonToTreeOptions = {}): JsonNode => {
  const { visited = new WeakSet(), keyPath = [ROOT_KEY] } = props
  const options = getPreviewOptions(props.options)

  if (data && typeof data === "object") {
    if (visited.has(data)) {
      return {
        value: "[Circular Reference]",
        type: "circular",
        keyPath: [...keyPath, "[Circular Reference]"],
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
      }),
    keyPath,
    options,
  })
}
