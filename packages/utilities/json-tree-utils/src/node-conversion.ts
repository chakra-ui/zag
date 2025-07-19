import { jsonToTree } from "./json-to-tree"
import { getPreviewOptions } from "./options"
import type { JsonNode, JsonNodePreviewOptions } from "./types"

const regexReturnCharacters = /\r/g

function hash(str: string) {
  const v = str.replace(regexReturnCharacters, "")
  let hash = 5381
  let i = v.length
  while (i--) hash = ((hash << 5) - hash) ^ v.charCodeAt(i)
  return (hash >>> 0).toString(36)
}

export function nodeToValue(node: JsonNode) {
  return hash(node.id)
}

export function nodeToString(node: JsonNode) {
  return node.key || "root"
}

export function getRootNode(data: unknown, opts?: Partial<JsonNodePreviewOptions>): JsonNode {
  return {
    id: "#",
    key: "",
    value: "",
    type: "object",
    children: [
      jsonToTree(data, {
        parentKey: "",
        parentId: "#",
        visited: new WeakSet(),
        keyPath: [],
        dataTypePath: "",
        options: getPreviewOptions(opts),
      }),
    ],
  }
}
