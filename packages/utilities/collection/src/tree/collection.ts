import { isEqual } from "@zag-js/utils/object"
import * as query from "./query"
import * as edit from "./edit"
import { filterTree } from "./filter"
import { flattenTree } from "./conversion"
import { getVisibleTreeNodes } from "./visible"
import type { DescendantOptions, FlatTreeNode, IndexPath, TreeSkipOptions } from "../types"
import type { TreeCollectionOptions, TreeNode } from "../types"

/** An immutable structural snapshot. Ordinal zero is the synthetic root. */
interface TreeData<T> {
  readonly rootNode: T
  readonly getNodeValue: (node: T) => string
  readonly getNodeChildren: (node: T) => T[]
  readonly getNodeChildrenCount: (node: T) => number | undefined
  readonly getNodeDisabled: (node: T) => boolean
  readonly stringifyNode: (node: T) => string
}

interface TreeIndex<T> {
  readonly options: TreeCollectionOptions<T>
  readonly nodes: readonly T[]
  readonly values: readonly string[]
  readonly byValue: ReadonlyMap<string, number>
  readonly parent: readonly number[]
  /** Exclusive end of each node's contiguous subtree. */
  readonly subtreeEnd: readonly number[]
  readonly depth: readonly number[]
  readonly siblingIndex: readonly number[]
}

const treeIndex = Symbol("treeIndex")

/** @internal */
export function getTreeIndex<T>(tree: TreeCollection<T>): TreeIndex<T> {
  return (tree as TreeCollection<T> & { [treeIndex]: TreeIndex<T> })[treeIndex]
}

// Methods live on the prototype; the factory attaches the snapshot data.
class IndexedTree<T> {
  getIndexPath(this: TreeCollection<T>, value: string): IndexPath | undefined
  getIndexPath(this: TreeCollection<T>, value: string[]): IndexPath
  getIndexPath(this: TreeCollection<T>, value: string | string[]): IndexPath | undefined {
    return typeof value === "string" ? query.getTreeIndexPath(this, value) : query.getTreeIndexPath(this, value)
  }

  isEqual(this: TreeCollection<T>, other: TreeCollection<T>): boolean {
    return isEqual(this.rootNode, other.rootNode)
  }

  getVisibleNodes(this: TreeCollection<T>, expanded: Iterable<string>): { node: T; indexPath: IndexPath }[] {
    return getVisibleTreeNodes(this, expanded)
  }

  stringify(this: TreeCollection<T>, value: string): string | null {
    return query.stringifyTreeNode(this, value)
  }

  at(this: TreeCollection<T>, path: IndexPath): T | undefined {
    return query.getTreeNodeAt(this, path)
  }

  findNode(this: TreeCollection<T>, value: string, root?: T): T | undefined {
    return query.findTreeNode(this, value, root)
  }

  findNodes(this: TreeCollection<T>, values: string[], root?: T): T[] {
    return query.findTreeNodes(this, values, root)
  }

  sort(this: TreeCollection<T>, values: string[]): string[] {
    return query.sortTreeValues(this, values)
  }

  getValue(this: TreeCollection<T>, path: IndexPath): string | undefined {
    return query.getTreeValue(this, path)
  }

  getValuePath(this: TreeCollection<T>, path: IndexPath | undefined): string[] {
    return query.getTreeValuePath(this, path)
  }

  getDepth(this: TreeCollection<T>, value: string): number {
    return query.getTreeDepth(this, value)
  }

  isSameNode(this: TreeCollection<T>, node: T, other: T): boolean {
    return query.isSameTreeNode(this, node, other)
  }

  isRootNode(this: TreeCollection<T>, node: T): boolean {
    return query.isTreeRootNode(this, node)
  }

  contains(this: TreeCollection<T>, parent: IndexPath, child: IndexPath): boolean {
    return query.containsTreePath(parent, child)
  }

  getParentNode(this: TreeCollection<T>, value: string | IndexPath): T | undefined {
    return query.getTreeParentNode(this, value)
  }

  getParentNodes(this: TreeCollection<T>, value: string | IndexPath): T[] {
    return query.getTreeParentNodes(this, value)
  }

  getDescendantNodes(this: TreeCollection<T>, value: string | IndexPath, options?: DescendantOptions): T[] {
    return query.getTreeDescendantNodes(this, value, options)
  }

  getDescendantValues(this: TreeCollection<T>, value: string | IndexPath, options?: DescendantOptions): string[] {
    return query.getTreeDescendantValues(this, value, options)
  }

  visit(this: TreeCollection<T>, options: Parameters<typeof query.visitTree<T>>[1]): void {
    return query.visitTree(this, options)
  }

  getSiblingNodes(this: TreeCollection<T>, path: IndexPath): T[] {
    return query.getTreeSiblingNodes(this, path)
  }

  getNextSibling(this: TreeCollection<T>, path: IndexPath): T | undefined {
    return query.getNextTreeSibling(this, path)
  }

  getPreviousSibling(this: TreeCollection<T>, path: IndexPath): T | undefined {
    return query.getPreviousTreeSibling(this, path)
  }

  getValues(this: TreeCollection<T>, root?: T): string[] {
    return query.getTreeValues(this, root)
  }

  getBranchValues(
    this: TreeCollection<T>,
    root?: T,
    options?: Parameters<typeof query.getTreeBranchValues<T>>[2],
  ): string[] {
    return query.getTreeBranchValues(this, root, options)
  }

  isBranchNode(this: TreeCollection<T>, node: T): boolean {
    return query.isTreeBranchNode(this, node)
  }

  flatten(this: TreeCollection<T>, root?: T): FlatTreeNode<T>[] {
    return flattenTree(this, root)
  }

  copy(this: TreeCollection<T>, root: T): TreeCollection<T> {
    return edit.withTreeRoot(this, root)
  }

  replace(this: TreeCollection<T>, path: IndexPath, node: T): TreeCollection<T> {
    return edit.replaceTreeNode(this, path, node)
  }

  remove(this: TreeCollection<T>, paths: IndexPath[]): TreeCollection<T> {
    return edit.removeTreeNodes(this, paths)
  }

  insertBefore(this: TreeCollection<T>, path: IndexPath, nodes: T[]): TreeCollection<T> | undefined {
    return edit.insertTreeBefore(this, path, nodes)
  }

  insertAfter(this: TreeCollection<T>, path: IndexPath, nodes: T[]): TreeCollection<T> | undefined {
    return edit.insertTreeAfter(this, path, nodes)
  }

  move(this: TreeCollection<T>, paths: IndexPath[], to: IndexPath): TreeCollection<T> {
    return edit.moveTreeNodes(this, paths, to)
  }

  filter(this: TreeCollection<T>, predicate: (node: T, path: IndexPath) => boolean): TreeCollection<T> {
    return filterTree(this, predicate)
  }

  toJSON(this: TreeCollection<T>): string[] {
    return this.getValues()
  }

  getFirstNode(this: TreeCollection<T>, root?: T, options?: TreeSkipOptions<T>): T | undefined {
    return query.getFirstTreeNode(this, root, options)
  }

  getLastNode(this: TreeCollection<T>, root?: T, options?: TreeSkipOptions<T>): T | undefined {
    return query.getLastTreeNode(this, root, options)
  }

  getNextNode(this: TreeCollection<T>, value: string, options?: TreeSkipOptions<T>): T | undefined {
    return query.getNextTreeNode(this, value, options)
  }

  getPreviousNode(this: TreeCollection<T>, value: string, options?: TreeSkipOptions<T>): T | undefined {
    return query.getPreviousTreeNode(this, value, options)
  }
}

/** An immutable indexed tree. Ordinal zero is the synthetic root. */
export type TreeCollection<T = TreeNode> = TreeData<T> & IndexedTree<T>

const valueOf = (node: any): string => (typeof node === "string" ? node : (node?.value ?? ""))
const childrenOf = (node: any): any[] => node?.children ?? []
const countOf = (node: any): number | undefined => node?.childrenCount
const disabledOf = (node: any): boolean => !!node?.disabled
const stringOf = (node: any): string => node?.label ?? valueOf(node)

/**
 * Index nested data once in preorder. Operations share a prototype.
 * Edits return a new snapshot.
 */
export function createTreeCollection<T = TreeNode>(options: TreeCollectionOptions<T>): TreeCollection<T> {
  const getNodeValue = options.nodeToValue ?? valueOf
  const readChildren = options.nodeToChildren
  const getNodeChildren = readChildren ? (node: T): T[] => readChildren(node) ?? childrenOf(node) : childrenOf
  const getNodeChildrenCount = options.nodeToChildrenCount ?? countOf
  const getNodeDisabled = options.isNodeDisabled ?? disabledOf
  const stringifyNode =
    options.nodeToString ?? (options.nodeToValue ? (node: T) => (node as any)?.label ?? getNodeValue(node) : stringOf)
  const nodes: T[] = []
  const values: string[] = []
  const byValue = new Map<string, number>()
  const parent: number[] = []
  const subtreeEnd: number[] = []
  const depth: number[] = []
  const siblingIndex: number[] = []

  // Iterative, one frame per depth level
  const enter = (node: T, parentIndex: number, position: number): number => {
    const value = getNodeValue(node)

    const index = nodes.length
    nodes.push(node)
    values.push(value)
    if (!byValue.has(value)) byValue.set(value, index)
    parent.push(parentIndex)
    depth.push(parentIndex < 0 ? 0 : depth[parentIndex] + 1)
    siblingIndex.push(position)
    return index
  }

  const root = enter(options.rootNode, -1, 0)
  const ancestors = new Set([options.rootNode])
  const stack = [{ index: root, children: getNodeChildren(options.rootNode), next: 0 }]
  while (stack.length > 0) {
    const frame = stack[stack.length - 1]
    if (frame.next === frame.children.length) {
      subtreeEnd[frame.index] = nodes.length
      ancestors.delete(nodes[frame.index])
      stack.pop()
      continue
    }
    const position = frame.next++
    const node = frame.children[position]
    const index = enter(node, frame.index, position)
    const children = getNodeChildren(node)
    if (children.length) {
      if (ancestors.has(node)) throw new Error("[zag-js/tree] Cyclic tree data")
      ancestors.add(node)
      stack.push({ index, children, next: 0 })
    } else {
      subtreeEnd[index] = nodes.length
    }
  }

  const data: TreeData<T> = {
    rootNode: options.rootNode,
    getNodeValue,
    getNodeChildren,
    getNodeChildrenCount,
    getNodeDisabled,
    stringifyNode,
  }
  const index: TreeIndex<T> = {
    options: { ...options },
    nodes,
    values,
    byValue,
    parent,
    subtreeEnd,
    depth,
    siblingIndex,
  }
  return Object.assign(new IndexedTree<T>(), data, { [treeIndex]: index })
}
