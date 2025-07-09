import { dataTypes, PrimitiveType } from "./data-type"
import type { JsonNode } from "./types"

const ROOT_ID = "#"

export const jsonToTree = (
  data: unknown,
  parentKey = "",
  parentId = "",
  visited = new WeakSet(),
  keyPath: (string | number)[] = [],
  dataTypePath = "",
): JsonNode => {
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
    createNode: jsonToTree,
    keyPath: currentKeyPath,
    dataTypePath: currentDataTypePath,
  })
}
