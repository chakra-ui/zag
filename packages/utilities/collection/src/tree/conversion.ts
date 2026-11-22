import { createTreeCollection, getTreeIndex, type TreeCollection } from "./collection"
import type { FilePathTreeNode, FlatTreeNode, TreeCollectionMethods } from "../types"

export function flattenTree<T>(tree: TreeCollection<T>, rootNode = tree.rootNode): Array<FlatTreeNode<T>> {
  const data = getTreeIndex(tree)
  if (rootNode !== tree.rootNode) return flattenTree(createTreeCollection({ ...data.options, rootNode }))
  const ids = [0]
  let next = 1
  return data.nodes.map((node, index) => {
    const children: number[] = []
    for (let child = index + 1; child < data.subtreeEnd[index]; child = data.subtreeEnd[child]) {
      ids[child] = next++
      children.push(ids[child])
    }
    return {
      ...node,
      _index: ids[index],
      _parent: ids[data.parent[index]],
      _children: children.length ? children : undefined,
    }
  })
}

export function flattenedToTree<T>(
  nodes: Array<FlatTreeNode<T>>,
  options: Partial<TreeCollectionMethods<T>> = {},
): TreeCollection<T> {
  if (nodes.length === 0) {
    throw new Error("[zag-js/tree] Cannot create tree from empty flattened array")
  }

  const rootFlatNode = nodes.find((node) => node._parent === undefined)
  if (!rootFlatNode) {
    throw new Error("[zag-js/tree] No root node found in flattened data")
  }

  const nodeMap = new Map<number, FlatTreeNode<T>>()
  nodes.forEach((node) => {
    nodeMap.set(node._index, node)
  })

  const buildNode = (idx: number): T => {
    const flatNode = nodeMap.get(idx)
    if (!flatNode) return {} as T

    const { _children, _parent, _index, ...cleanNode } = flatNode

    const children: T[] = []
    _children?.forEach((childIndex) => {
      children.push(buildNode(childIndex))
    })

    return {
      ...cleanNode,
      ...(children.length > 0 && { children }),
    } as T
  }

  const rootNode = buildNode(rootFlatNode._index)

  return createTreeCollection({ ...options, rootNode })
}

export function filePathToTree(paths: string[]): TreeCollection<FilePathTreeNode> {
  const rootNode: FilePathTreeNode = {
    label: "",
    value: "ROOT",
    children: [],
  }

  // A node's value is its path prefix, which identifies it under its parent
  const byPrefix = new Map<string, FilePathTreeNode>()
  for (const path of paths) {
    let currentNode = rootNode
    let prefix = ""
    path.split("/").forEach((part, index) => {
      prefix = index === 0 ? part : `${prefix}/${part}`
      let childNode = byPrefix.get(prefix)
      if (!childNode) {
        childNode = { value: prefix, label: part }
        byPrefix.set(prefix, childNode)
        ;(currentNode.children ||= []).push(childNode)
      }
      currentNode = childNode
    })
  }

  return createTreeCollection({ rootNode })
}
