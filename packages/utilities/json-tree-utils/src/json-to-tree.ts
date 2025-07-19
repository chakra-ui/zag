import { dataTypes, PrimitiveType } from "./data-type"
import { getPreviewOptions } from "./options"
import type { JsonNode, JsonNodePreviewOptions } from "./types"

const ROOT_ID = "#"

export interface JsonToTreeOptions {
  parentKey?: string | undefined
  parentId?: string | undefined
  visited?: WeakSet<WeakKey> | undefined
  keyPath?: (string | number)[] | undefined
  dataTypePath?: string | undefined
  options?: JsonNodePreviewOptions | undefined
}

export const jsonToTree = (data: unknown, props: JsonToTreeOptions = {}): JsonNode => {
  const { parentKey = "", parentId = "", visited = new WeakSet(), keyPath = [], dataTypePath = "" } = props
  const options = getPreviewOptions(props.options)

  const id = parentId ? `${parentId}/${parentKey}` : parentKey || ROOT_ID

  // Build the full path from root - only add parentKey if it's not empty and not 'root'
  const currentKeyPath = parentKey && parentKey !== ROOT_ID ? [...keyPath, parentKey] : keyPath
  const currentDataTypePath = dataTypePath ? `${dataTypePath}/${parentKey}` : parentKey || ""

  // Check for circular references for objects
  if (data && typeof data === "object") {
    if (visited.has(data)) {
      return {
        id,
        key: parentKey,
        value: "[Circular Reference]",
        type: "circular",
        keyPath: currentKeyPath,
        dataTypePath: currentDataTypePath,
      }
    }
    visited.add(data)
  }

  const dataType = dataTypes.find((dataType) => dataType.check(data)) || PrimitiveType
  return dataType.node({
    value: data,
    id,
    parentKey,
    visited,
    createNode: (value, key, id, visited, keyPath, dataTypePath) =>
      jsonToTree(value, { parentKey: key, parentId: id, visited, keyPath, dataTypePath, options }),
    keyPath: currentKeyPath,
    dataTypePath: currentDataTypePath,
    options,
  })
}
