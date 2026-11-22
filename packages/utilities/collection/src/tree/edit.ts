import { createTreeCollection, getTreeIndex, type TreeCollection } from "./collection"
import { getTreeOrdinal } from "./query"
import type { IndexPath } from "../types"

export function withTreeRoot<T>(tree: TreeCollection<T>, rootNode: T): TreeCollection<T> {
  return rootNode === tree.rootNode ? tree : createTreeCollection({ ...getTreeIndex(tree).options, rootNode })
}

export function createTreeNode<T>(tree: TreeCollection<T>, node: T, children: T[]): T {
  const { nodeToCreate } = getTreeIndex(tree).options
  if (nodeToCreate) return nodeToCreate(node, children)
  return tree.getNodeChildren(node).length || children.length ? { ...node, children } : node
}

interface Change<T> {
  remove: Set<number>
  insert?: { position: number; nodes: T[] }
}

/** Apply edits against the original sibling positions and copy only affected ancestors. */
function editTree<T>(tree: TreeCollection<T>, paths: IndexPath[], target?: IndexPath, items?: T[]): TreeCollection<T> {
  const data = getTreeIndex(tree)
  const changes = new Map<number, Change<T>>()
  function mark(index: number): Change<T> {
    const existing = changes.get(index)
    if (existing) return existing
    const change = { remove: new Set<number>() }
    for (let current = index; current >= 0 && !changes.has(current); current = data.parent[current]) {
      changes.set(current, current === index ? change : { remove: new Set() })
    }
    return change
  }

  for (const path of paths) {
    if (!path.length) throw new Error("[zag-js/tree] Cannot remove or move the root")
    const index = getTreeOrdinal(tree, path)
    if (index != null) mark(data.parent[index]).remove.add(data.siblingIndex[index])
  }

  if (target && items?.length) {
    if (!target.length) throw new Error("[zag-js/tree] Cannot insert at the root")
    const parent = getTreeOrdinal(tree, target.slice(0, -1))
    if (parent == null) return tree
    mark(parent).insert = { position: target[target.length - 1], nodes: items }
  }

  const updated = new Map<number, T>()
  for (const parent of [...changes.keys()].sort((a, b) => b - a)) {
    const { remove, insert } = changes.get(parent)!
    const children: T[] = []
    let position = 0
    for (let index = parent + 1; index < data.subtreeEnd[parent]; index = data.subtreeEnd[index]) {
      if (insert?.position === position) children.push(...insert.nodes)
      if (!remove.has(position)) children.push(updated.get(index) ?? data.nodes[index])
      position++
    }
    if (insert && insert.position >= position) children.push(...insert.nodes)
    updated.set(parent, createTreeNode(tree, data.nodes[parent], children))
  }
  return updated.has(0) ? withTreeRoot(tree, updated.get(0)!) : tree
}

export function replaceTreeNode<T>(tree: TreeCollection<T>, path: IndexPath, node: T): TreeCollection<T> {
  return path.length ? editTree(tree, [path], path, [node]) : withTreeRoot(tree, node)
}

export function removeTreeNodes<T>(tree: TreeCollection<T>, paths: IndexPath[]): TreeCollection<T> {
  return editTree(tree, paths)
}

export function insertTreeBefore<T>(
  tree: TreeCollection<T>,
  path: IndexPath,
  nodes: T[],
): TreeCollection<T> | undefined {
  if (getTreeOrdinal(tree, path.slice(0, -1)) == null) return undefined
  return editTree(tree, [], path, nodes)
}

export function insertTreeAfter<T>(
  tree: TreeCollection<T>,
  path: IndexPath,
  nodes: T[],
): TreeCollection<T> | undefined {
  if (!path.length) return undefined
  return insertTreeBefore(tree, [...path.slice(0, -1), path[path.length - 1] + 1], nodes)
}

export function moveTreeNodes<T>(tree: TreeCollection<T>, paths: IndexPath[], to: IndexPath): TreeCollection<T> {
  const data = getTreeIndex(tree)
  const indices = [...new Set(paths.map((path) => getTreeOrdinal(tree, path)))]
    .filter((index): index is number => index != null)
    .sort((a, b) => a - b)
  const roots: number[] = []
  let end = 0
  for (const index of indices) {
    if (index < end) continue
    roots.push(index)
    end = data.subtreeEnd[index]
  }
  const parent = getTreeOrdinal(tree, to.slice(0, -1))
  if (parent != null && roots.some((index) => index <= parent && parent < data.subtreeEnd[index])) {
    throw new Error("[zag-js/tree] Cannot move a node into its own subtree")
  }
  return editTree(
    tree,
    paths,
    to,
    roots.map((index) => data.nodes[index]),
  )
}
