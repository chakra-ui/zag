import { jsonToTree } from "./json-to-tree"
import { defu } from "./shared"
import type { JsonNode, JsonNodePreviewOptions } from "./types"

export const ROOT_KEY = "$"
export const PATH_SEP = "."

export function isRootKeyPath(keyPath: Array<string | number>): boolean {
  return keyPath.length === 1 && keyPath[0] === ROOT_KEY
}

/** The node's path joined with `.`, like `$.user.name` */
export function keyPathToId(keyPath: Array<string | number>): string {
  return keyPath.join(PATH_SEP)
}

/** The last segment of a path: the property, index or entry name */
export function keyPathToKey(keyPath: Array<string | number>, opts?: { excludeRoot?: boolean }): string {
  if (keyPath.length === 0) return ""
  if (opts?.excludeRoot && isRootKeyPath(keyPath)) return ""
  return String(keyPath[keyPath.length - 1])
}

/** A node's value: its path, like `$.user.name` */
export function nodeToValue(node: JsonNode) {
  return keyPathToId(node.keyPath)
}

/** The value of the node at `path`, matching `nodeToValue` */
export function jsonPathToValue(path: string) {
  return path
}

export function nodeToString(node: JsonNode) {
  return keyPathToKey(node.keyPath) || "root"
}

/** Wraps the converted value in a root node, the shape a tree view collection expects */
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
