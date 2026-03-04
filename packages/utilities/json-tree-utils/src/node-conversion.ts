import { jsonToTree } from "./json-to-tree"
import { defu, hash } from "./shared"
import type { JsonNode, JsonNodePreviewOptions } from "./types"

export const ROOT_KEY = "$"
export const PATH_SEP = "."

////////////////////////////////////////////////////////////////////////////////////////////////////////

export function isRootKeyPath(keyPath: Array<string | number>): boolean {
  return keyPath.length === 1 && keyPath[0] === ROOT_KEY
}

export function keyPathToId(keyPath: Array<string | number>): string {
  return keyPath.join(PATH_SEP)
}

export function keyPathToKey(keyPath: Array<string | number>, opts?: { excludeRoot?: boolean }): string {
  if (keyPath.length === 0) return ""
  if (opts?.excludeRoot && isRootKeyPath(keyPath)) return ""
  return String(keyPath[keyPath.length - 1])
}

export function nodeToValue(node: JsonNode) {
  return hash(keyPathToId(node.keyPath))
}

export function jsonPathToValue(path: string) {
  return hash(path)
}

export function nodeToString(node: JsonNode) {
  return keyPathToKey(node.keyPath) || "root"
}

export function getRootNode(data: unknown, opts?: Partial<JsonNodePreviewOptions>): JsonNode {
  return {
    value: "",
    type: "object",
    keyPath: [],
    children: [
      jsonToTree(data, {
        visited: new WeakSet(),
        keyPath: [ROOT_KEY],
        options: getPreviewOptions(opts),
      }),
    ],
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////

export const DEFAULT_PREVIEW_OPTIONS: JsonNodePreviewOptions = {
  maxPreviewItems: 3,
  collapseStringsAfterLength: 30,
  groupArraysAfterLength: 100,
  showNonenumerable: true,
}

export const getPreviewOptions = (opts?: Partial<JsonNodePreviewOptions> | undefined): JsonNodePreviewOptions => {
  if (!opts) return DEFAULT_PREVIEW_OPTIONS
  return defu(DEFAULT_PREVIEW_OPTIONS, opts)
}
