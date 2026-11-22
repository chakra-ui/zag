import { getTreeIndex, type TreeCollection } from "./collection"
import type { DescendantOptions, IndexPath, TreeSkipOptions } from "../types"

/** Reconstruct a path only when a caller needs one. */
export function getTreeIndexPathAt<T>(tree: TreeCollection<T>, index: number): IndexPath {
  const data = getTreeIndex(tree)
  const path: number[] = []
  for (let current = index; current > 0; current = data.parent[current]) path.push(data.siblingIndex[current])
  return path.reverse()
}

export function getTreeOrdinal<T>(tree: TreeCollection<T>, path: IndexPath): number | undefined {
  const data = getTreeIndex(tree)
  let parent = 0
  for (const position of path) {
    let child = parent + 1
    while (child < data.subtreeEnd[parent] && data.siblingIndex[child] < position) child = data.subtreeEnd[child]
    if (child >= data.subtreeEnd[parent] || data.siblingIndex[child] !== position) return undefined
    parent = child
  }
  return parent
}

export function getTreeNodeAt<T>(tree: TreeCollection<T>, path: IndexPath): T | undefined {
  let node = tree.rootNode
  for (const position of path) {
    node = tree.getNodeChildren(node)[position]
    if (node === undefined) return undefined
  }
  return node
}

export function getTreeIndexPath<T>(tree: TreeCollection<T>, value: string): IndexPath | undefined
export function getTreeIndexPath<T>(tree: TreeCollection<T>, value: string[]): IndexPath
export function getTreeIndexPath<T>(tree: TreeCollection<T>, value: string | string[]): IndexPath | undefined {
  const data = getTreeIndex(tree)
  if (typeof value === "string") {
    const index = data.byValue.get(value)
    return index == null ? undefined : getTreeIndexPathAt(tree, index)
  }
  const path: IndexPath = []
  let parent = 0
  for (const key of value) {
    let child = parent + 1
    while (child < data.subtreeEnd[parent] && data.values[child] !== key) child = data.subtreeEnd[child]
    if (child >= data.subtreeEnd[parent]) break
    path.push(data.siblingIndex[child])
    parent = child
  }
  return path
}

export function findTreeNode<T>(tree: TreeCollection<T>, value: string, root = tree.rootNode): T | undefined {
  const data = getTreeIndex(tree)
  if (root === tree.rootNode) {
    const index = data.byValue.get(value)
    return index == null ? undefined : data.nodes[index]
  }
  const start = data.nodes.indexOf(root)
  if (start < 0) return tree.copy(root).findNode(value)
  for (let index = start; index < data.subtreeEnd[start]; index++) {
    if (data.values[index] === value) return data.nodes[index]
  }
  return undefined
}

export function findTreeNodes<T>(tree: TreeCollection<T>, values: string[], root = tree.rootNode): T[] {
  const data = getTreeIndex(tree)
  const start = root === tree.rootNode ? 0 : data.nodes.indexOf(root)
  if (start < 0) return tree.copy(root).findNodes(values)
  const keys = new Set(values)
  const result: T[] = []
  for (let index = start; index < data.subtreeEnd[start]; index++) {
    if (keys.has(data.values[index])) result.push(data.nodes[index])
  }
  return result
}

export function getTreeValue<T>(tree: TreeCollection<T>, path: IndexPath): string | undefined {
  const node = getTreeNodeAt(tree, path)
  return node === undefined ? undefined : tree.getNodeValue(node)
}

export function getTreeValuePath<T>(tree: TreeCollection<T>, path: IndexPath | undefined): string[] {
  const data = getTreeIndex(tree)
  if (!path) return []
  const values: string[] = []
  let index = getTreeOrdinal(tree, path) ?? 0
  while (index > 0) {
    values.push(data.values[index])
    index = data.parent[index]
  }
  return values.reverse()
}

export function getTreeDepth<T>(tree: TreeCollection<T>, value: string): number {
  const data = getTreeIndex(tree)
  const index = data.byValue.get(value)
  return index == null ? 0 : data.depth[index]
}

export function isSameTreeNode<T>(tree: TreeCollection<T>, node: T, other: T): boolean {
  return tree.getNodeValue(node) === tree.getNodeValue(other)
}

export function isTreeRootNode<T>(tree: TreeCollection<T>, node: T): boolean {
  return isSameTreeNode(tree, node, tree.rootNode)
}

export function containsTreePath(parent: IndexPath, child: IndexPath): boolean {
  return child.length >= parent.length && parent.every((value, index) => child[index] === value)
}

export function isTreeBranchNode<T>(tree: TreeCollection<T>, node: T): boolean {
  return tree.getNodeChildren(node).length > 0 || tree.getNodeChildrenCount(node) != null
}

function resolveIndex<T>(tree: TreeCollection<T>, value: string | IndexPath): number | undefined {
  if (typeof value === "string") return getTreeIndex(tree).byValue.get(value)
  return getTreeOrdinal(tree, value)
}

export function getTreeParentNode<T>(tree: TreeCollection<T>, value: string | IndexPath): T | undefined {
  const data = getTreeIndex(tree)
  const index = resolveIndex(tree, value)
  return index == null ? undefined : index === 0 ? tree.rootNode : data.nodes[data.parent[index]]
}

export function getTreeParentNodes<T>(tree: TreeCollection<T>, value: string | IndexPath): T[] {
  const data = getTreeIndex(tree)
  const start = resolveIndex(tree, value)
  if (start == null || start < 0) return []
  const nodes: T[] = []
  for (let index = data.parent[start]; index > 0; index = data.parent[index]) nodes.push(data.nodes[index])
  return nodes.reverse()
}

export function getTreeDescendantNodes<T>(
  tree: TreeCollection<T>,
  value: string | IndexPath,
  options?: DescendantOptions,
): T[] {
  const data = getTreeIndex(tree)
  const index = resolveIndex(tree, value)
  if (index == null) return []
  const result: T[] = []
  for (let child = index + 1; child < data.subtreeEnd[index]; child++) {
    if (options?.withBranch || !isTreeBranchNode(tree, data.nodes[child])) result.push(data.nodes[child])
  }
  return result
}

export function getTreeDescendantValues<T>(
  tree: TreeCollection<T>,
  value: string | IndexPath,
  options?: DescendantOptions,
): string[] {
  return getTreeDescendantNodes(tree, value, options).map(tree.getNodeValue)
}

export function getTreeValues<T>(tree: TreeCollection<T>, root = tree.rootNode): string[] {
  const data = getTreeIndex(tree)
  const index = root === tree.rootNode ? 0 : data.nodes.indexOf(root)
  return index < 0 ? tree.copy(root).getValues() : data.values.slice(index + 1, data.subtreeEnd[index])
}

export function sortTreeValues<T>(tree: TreeCollection<T>, values: string[]): string[] {
  const data = getTreeIndex(tree)
  return values.filter((value) => data.byValue.has(value)).sort((a, b) => data.byValue.get(a)! - data.byValue.get(b)!)
}

export function getTreeSiblingNodes<T>(tree: TreeCollection<T>, path: IndexPath): T[] {
  const parent = getTreeNodeAt(tree, path.slice(0, -1))
  return parent === undefined ? [] : tree.getNodeChildren(parent)
}

function sibling<T>(tree: TreeCollection<T>, path: IndexPath, step: number): T | undefined {
  const siblings = getTreeSiblingNodes(tree, path)
  for (let index = path[path.length - 1] + step; index >= 0 && index < siblings.length; index += step) {
    if (!tree.getNodeDisabled(siblings[index])) return siblings[index]
  }
  return undefined
}

export const getNextTreeSibling = <T>(tree: TreeCollection<T>, path: IndexPath): T | undefined => sibling(tree, path, 1)
export const getPreviousTreeSibling = <T>(tree: TreeCollection<T>, path: IndexPath): T | undefined =>
  sibling(tree, path, -1)

export interface TreeVisitOptions<T> extends TreeSkipOptions<T> {
  reuseIndexPath?: boolean | undefined
  onEnter?(node: T, indexPath: IndexPath): void | "skip" | "stop"
  onLeave?(node: T, indexPath: IndexPath): void | "stop"
}

/** Optional callback traversal; rendering and keyboard navigation use ordinals directly. */
export function visitTree<T>(tree: TreeCollection<T>, options: TreeVisitOptions<T>): void {
  const data = getTreeIndex(tree)
  const pending = [0]
  let index = 1
  while (index < data.nodes.length || pending.length > 0) {
    const leaving = pending[pending.length - 1]
    if (leaving != null && data.subtreeEnd[leaving] <= index) {
      pending.pop()
      if (options.onLeave?.(data.nodes[leaving], getTreeIndexPathAt(tree, leaving)) === "stop") return
      continue
    }
    if (index >= data.nodes.length) break
    const node = data.nodes[index]
    const indexPath = getTreeIndexPathAt(tree, index)
    if (options.skip?.({ node, value: data.values[index], indexPath })) {
      index = data.subtreeEnd[index]
      continue
    }
    const result = options.onEnter?.(node, indexPath)
    if (result === "stop") return
    if (result === "skip") index = data.subtreeEnd[index]
    else pending.push(index++)
  }
}

export function getTreeBranchValues<T>(
  tree: TreeCollection<T>,
  root = tree.rootNode,
  options: TreeSkipOptions<T> & { depth?: number | ((depth: number) => boolean) } = {},
): string[] {
  const data = getTreeIndex(tree)
  const start = root === tree.rootNode ? 0 : data.nodes.indexOf(root)
  if (start < 0) return tree.copy(root).getBranchValues(undefined, options)
  const values: string[] = []
  for (let index = start + 1; index < data.subtreeEnd[start]; index++) {
    const node = data.nodes[index]
    const depth = data.depth[index] - data.depth[start]
    if (
      options.skip?.({
        node,
        value: data.values[index],
        indexPath: getTreeIndexPathAt(tree, index).slice(data.depth[start]),
      })
    ) {
      index = data.subtreeEnd[index] - 1
      continue
    }
    if (!isTreeBranchNode(tree, node)) continue
    if (
      options.depth != null &&
      !(typeof options.depth === "function" ? options.depth(depth) : depth === options.depth)
    )
      continue
    values.push(data.values[index])
  }
  return values
}

function findEnabled<T>(tree: TreeCollection<T>, start: number, end: number, step: 1 | -1): T | undefined {
  for (let index = start; index !== end; index += step) {
    const node = getTreeIndex(tree).nodes[index]
    if (!tree.getNodeDisabled(node)) return node
  }
}

function edgeNode<T>(tree: TreeCollection<T>, root: T, options: TreeSkipOptions<T>, last: boolean): T | undefined {
  const data = getTreeIndex(tree)
  const start = root === tree.rootNode ? 0 : data.nodes.indexOf(root)
  if (start < 0) {
    const subtree = tree.copy(root)
    return last ? subtree.getLastNode(undefined, options) : subtree.getFirstNode(undefined, options)
  }
  const end = data.subtreeEnd[start]
  const { skip } = options
  if (!skip) return last ? findEnabled(tree, end - 1, start, -1) : findEnabled(tree, start + 1, end, 1)

  let result: T | undefined
  for (let index = start + 1; index < end; index++) {
    const node = data.nodes[index]
    const indexPath = getTreeIndexPathAt(tree, index).slice(data.depth[start])
    if (skip({ node, value: data.values[index], indexPath })) index = data.subtreeEnd[index] - 1
    else if (!tree.getNodeDisabled(node)) {
      if (!last) return node
      result = node
    }
  }
  return result
}

export function getFirstTreeNode<T>(tree: TreeCollection<T>, root = tree.rootNode, options: TreeSkipOptions<T> = {}) {
  return edgeNode(tree, root, options, false)
}

export function getLastTreeNode<T>(tree: TreeCollection<T>, root = tree.rootNode, options: TreeSkipOptions<T> = {}) {
  return edgeNode(tree, root, options, true)
}

function adjacentNode<T>(
  tree: TreeCollection<T>,
  value: string,
  options: TreeSkipOptions<T>,
  step: 1 | -1,
): T | undefined {
  const data = getTreeIndex(tree)
  const start = data.byValue.get(value)
  if (start == null || start === 0) return undefined
  const { skip } = options
  if (!skip) return findEnabled(tree, start + step, step === 1 ? data.nodes.length : 0, step)

  let previous: T | undefined
  let found = false
  for (let index = 1; index < data.nodes.length; index++) {
    const node = data.nodes[index]
    const key = data.values[index]
    if (skip({ node, value: key, indexPath: getTreeIndexPathAt(tree, index) })) {
      if (step === 1 && key === value) found = true
      index = data.subtreeEnd[index] - 1
      continue
    }
    if (step === -1 && key === value) return previous
    if (!tree.getNodeDisabled(node)) {
      if (found) return node
      previous = node
    }
    if (step === 1 && key === value) found = true
  }
  return undefined
}

export function getNextTreeNode<T>(tree: TreeCollection<T>, value: string, options: TreeSkipOptions<T> = {}) {
  return adjacentNode(tree, value, options, 1)
}

export function getPreviousTreeNode<T>(tree: TreeCollection<T>, value: string, options: TreeSkipOptions<T> = {}) {
  return adjacentNode(tree, value, options, -1)
}

export function stringifyTreeNode<T>(tree: TreeCollection<T>, value: string): string | null {
  const node = findTreeNode(tree, value)
  return node === undefined ? null : tree.stringifyNode(node)
}
