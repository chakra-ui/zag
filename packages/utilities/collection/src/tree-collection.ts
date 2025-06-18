import { compact, hasProp, isEqual, isObject } from "@zag-js/utils"
import {
  access,
  compareIndexPaths,
  filter,
  find,
  findIndexPath,
  flatMap,
  flatten,
  insert,
  move,
  remove,
  replace,
  visit,
  type IndexPath,
  type TreeVisitOptions,
} from "./tree-visit"
import type {
  FilePathTreeNode,
  FlatTreeNode,
  TreeCollectionMethods,
  TreeCollectionOptions,
  TreeNode,
  TreeSkipOptions,
} from "./types"

export class TreeCollection<T = TreeNode> {
  rootNode: T

  constructor(private options: TreeCollectionOptions<T>) {
    this.rootNode = options.rootNode
  }

  isEqual = (other: TreeCollection<T>): boolean => {
    return isEqual(this.rootNode, other.rootNode)
  }

  getNodeChildren = (node: T): T[] => {
    return this.options.nodeToChildren?.(node) ?? fallbackMethods.nodeToChildren(node) ?? []
  }

  private _indexPath = (valueOrIndexPath: string | IndexPath): IndexPath | undefined => {
    return typeof valueOrIndexPath === "string" ? this.getIndexPath(valueOrIndexPath) : valueOrIndexPath
  }

  getNodeChildrenCount = (node: T): number | undefined => {
    return this.options.nodeToChildrenCount?.(node) ?? fallbackMethods.nodeToChildrenCount(node)
  }

  getNodeValue = (node: T): string => {
    return this.options.nodeToValue?.(node) ?? fallbackMethods.nodeToValue(node)
  }

  getNodeDisabled = (node: T): boolean => {
    return this.options.isNodeDisabled?.(node) ?? fallbackMethods.isNodeDisabled(node)
  }

  stringify = (value: string): string | null => {
    const node = this.findNode(value)
    if (!node) return null
    return this.stringifyNode(node)
  }

  stringifyNode = (node: T): string => {
    return this.options.nodeToString?.(node) ?? fallbackMethods.nodeToString(node)
  }

  getFirstNode = (rootNode = this.rootNode): T | undefined => {
    let firstChild: T | undefined
    visit(rootNode, {
      getChildren: this.getNodeChildren,
      onEnter: (node, indexPath) => {
        if (!firstChild && indexPath.length > 0 && !this.getNodeDisabled(node)) {
          firstChild = node
          return "stop"
        }
      },
    })
    return firstChild
  }

  getLastNode = (rootNode = this.rootNode, opts: TreeSkipOptions<T> = {}): T | undefined => {
    let lastChild: T | undefined
    visit(rootNode, {
      getChildren: this.getNodeChildren,
      onEnter: (node, indexPath) => {
        const nodeValue = this.getNodeValue(node)
        if (opts.skip?.({ value: nodeValue, node, indexPath })) return "skip"
        if (indexPath.length > 1) return "skip"
        if (!this.getNodeDisabled(node)) {
          lastChild = node
        }
      },
    })
    return lastChild
  }

  at = (indexPath: IndexPath): T | undefined => {
    return access(this.rootNode, indexPath, {
      getChildren: this.getNodeChildren,
    })
  }

  findNode = (value: string, rootNode = this.rootNode): T | undefined => {
    return find(rootNode, {
      getChildren: this.getNodeChildren,
      predicate: (node) => this.getNodeValue(node) === value,
    })
  }

  sort = (values: string[]): string[] => {
    return values
      .reduce<Array<{ value: string; indexPath: IndexPath }>>((acc, value) => {
        const indexPath = this.getIndexPath(value)
        if (indexPath) acc.push({ value, indexPath })
        return acc
      }, [])
      .sort((a, b) => compareIndexPaths(a.indexPath, b.indexPath))
      .map(({ value }) => value)
  }

  getIndexPath = (value: string): IndexPath | undefined => {
    return findIndexPath(this.rootNode, {
      getChildren: this.getNodeChildren,
      predicate: (node) => this.getNodeValue(node) === value,
    })
  }

  getValue = (indexPath: IndexPath): string | undefined => {
    const node = this.at(indexPath)
    return node ? this.getNodeValue(node) : undefined
  }

  getValuePath = (indexPath: IndexPath | undefined): string[] => {
    if (!indexPath) return []
    const valuePath: string[] = []
    let currentPath = [...indexPath]
    while (currentPath.length > 0) {
      const node = this.at(currentPath)
      if (node) valuePath.unshift(this.getNodeValue(node))
      currentPath.pop()
    }
    return valuePath
  }

  getDepth = (value: string) => {
    const indexPath = findIndexPath(this.rootNode, {
      getChildren: this.getNodeChildren,
      predicate: (node) => this.getNodeValue(node) === value,
    })
    return indexPath?.length ?? 0
  }

  isRootNode = (node: T) => {
    return this.getNodeValue(node) === this.getNodeValue(this.rootNode)
  }

  contains = (parentIndexPath: IndexPath, valueIndexPath: IndexPath) => {
    if (!parentIndexPath || !valueIndexPath) return false
    return valueIndexPath.slice(0, parentIndexPath.length).every((_, i) => parentIndexPath[i] === valueIndexPath[i])
  }

  getNextNode = (value: string, opts: TreeSkipOptions<T> = {}): T | undefined => {
    let found = false
    let nextNode: T | undefined

    visit(this.rootNode, {
      getChildren: this.getNodeChildren,
      onEnter: (node, indexPath) => {
        if (this.isRootNode(node)) return
        const nodeValue = this.getNodeValue(node)
        if (opts.skip?.({ value: nodeValue, node, indexPath })) {
          if (nodeValue === value) {
            found = true
          }
          return "skip"
        }
        if (found && !this.getNodeDisabled(node)) {
          nextNode = node
          return "stop"
        }
        if (nodeValue === value) {
          found = true
        }
      },
    })

    return nextNode
  }

  getPreviousNode = (value: string, opts: TreeSkipOptions<T> = {}): T | undefined => {
    let previousNode: T | undefined
    let found = false
    visit(this.rootNode, {
      getChildren: this.getNodeChildren,
      onEnter: (node, indexPath) => {
        if (this.isRootNode(node)) return
        const nodeValue = this.getNodeValue(node)

        if (opts.skip?.({ value: nodeValue, node, indexPath })) {
          return "skip"
        }

        if (nodeValue === value) {
          found = true
          return "stop"
        }

        if (!this.getNodeDisabled(node)) {
          previousNode = node
        }
      },
    })
    return found ? previousNode : undefined
  }

  getParentNodes = (valueOrIndexPath: string | IndexPath): T[] => {
    const indexPath = this._indexPath(valueOrIndexPath)
    const result: T[] = []
    while (indexPath && indexPath.length > 0) {
      indexPath.pop()
      const parentNode = this.at(indexPath)
      if (parentNode && !this.isRootNode(parentNode)) {
        result.unshift(parentNode)
      }
    }
    return result
  }

  private getParentIndexPath = (indexPath: IndexPath): IndexPath => {
    return indexPath.slice(0, -1)
  }

  getParentNode = (valueOrIndexPath: string | IndexPath): T | undefined => {
    const indexPath = this._indexPath(valueOrIndexPath)
    return indexPath ? this.at(this.getParentIndexPath(indexPath)) : undefined
  }

  visit = (opts: Omit<TreeVisitOptions<T>, "getChildren"> & TreeSkipOptions<T>) => {
    const { skip, ...rest } = opts
    visit(this.rootNode, {
      ...rest,
      getChildren: this.getNodeChildren,
      onEnter: (node, indexPath) => {
        if (this.isRootNode(node)) return
        if (skip?.({ value: this.getNodeValue(node), node, indexPath })) return "skip"
        return rest.onEnter?.(node, indexPath)
      },
    })
  }

  getPreviousSibling = (indexPath: IndexPath): T | undefined => {
    const parentNode = this.getParentNode(indexPath)
    if (!parentNode) return
    const siblings = this.getNodeChildren(parentNode)
    let idx = siblings.findIndex((sibling) => this.getValue(indexPath) === this.getNodeValue(sibling))
    while (--idx >= 0) {
      const sibling = siblings[idx]
      if (!this.getNodeDisabled(sibling)) return sibling
    }
    return
  }

  getNextSibling = (indexPath: IndexPath): T | undefined => {
    const parentNode = this.getParentNode(indexPath)
    if (!parentNode) return
    const siblings = this.getNodeChildren(parentNode)
    let idx = siblings.findIndex((sibling) => this.getValue(indexPath) === this.getNodeValue(sibling))
    while (++idx < siblings.length) {
      const sibling = siblings[idx]
      if (!this.getNodeDisabled(sibling)) return sibling
    }
    return
  }

  getSiblingNodes = (indexPath: IndexPath): T[] => {
    const parentNode = this.getParentNode(indexPath)
    return parentNode ? this.getNodeChildren(parentNode) : []
  }

  getValues = (rootNode = this.rootNode): string[] => {
    const values = flatMap(rootNode, {
      getChildren: this.getNodeChildren,
      transform: (node) => [this.getNodeValue(node)],
    })
    // remove the root node
    return values.slice(1)
  }

  private isSameDepth = (indexPath: IndexPath, depth?: number): boolean => {
    if (depth == null) return true
    return indexPath.length === depth
  }

  isBranchNode = (node: T): boolean => {
    return this.getNodeChildren(node).length > 0 || this.getNodeChildrenCount(node) != null
  }

  getBranchValues = (rootNode = this.rootNode, opts: TreeSkipOptions<T> & { depth?: number } = {}): string[] => {
    let values: string[] = []
    visit(rootNode, {
      getChildren: this.getNodeChildren,
      onEnter: (node, indexPath) => {
        const nodeValue = this.getNodeValue(node)
        if (opts.skip?.({ value: nodeValue, node, indexPath })) return "skip"
        if (this.isBranchNode(node) && this.isSameDepth(indexPath, opts.depth)) {
          values.push(this.getNodeValue(node))
        }
      },
    })
    // remove the root node
    return values.slice(1)
  }

  flatten = (rootNode = this.rootNode): Array<FlatTreeNode<T>> => {
    return flatten(rootNode, { getChildren: this.getNodeChildren })
  }

  private _create = (node: T, children: T[]) => {
    return compact({ ...node, children })
  }

  private _insert = (rootNode: T, indexPath: IndexPath, nodes: T[]): TreeCollection<T> => {
    return this.copy(
      insert(rootNode, { at: indexPath, nodes, getChildren: this.getNodeChildren, create: this._create }),
    )
  }

  copy = (rootNode: T): TreeCollection<T> => {
    return new TreeCollection({ ...this.options, rootNode })
  }

  private _replace = (rootNode: T, indexPath: IndexPath, node: T): TreeCollection<T> => {
    return this.copy(
      replace(rootNode, { at: indexPath, node, getChildren: this.getNodeChildren, create: this._create }),
    )
  }

  private _move = (rootNode: T, indexPaths: IndexPath[], to: IndexPath): TreeCollection<T> => {
    return this.copy(move(rootNode, { indexPaths, to, getChildren: this.getNodeChildren, create: this._create }))
  }

  private _remove = (rootNode: T, indexPaths: IndexPath[]): TreeCollection<T> => {
    return this.copy(remove(rootNode, { indexPaths, getChildren: this.getNodeChildren, create: this._create }))
  }

  replace = (indexPath: IndexPath, node: T): TreeCollection<T> => {
    return this._replace(this.rootNode, indexPath, node)
  }

  remove = (indexPaths: IndexPath[]): TreeCollection<T> => {
    return this._remove(this.rootNode, indexPaths)
  }

  insertBefore = (indexPath: IndexPath, nodes: T[]): TreeCollection<T> | undefined => {
    const parentNode = this.getParentNode(indexPath)
    return parentNode ? this._insert(this.rootNode, indexPath, nodes) : undefined
  }

  insertAfter = (indexPath: IndexPath, nodes: T[]): TreeCollection<T> | undefined => {
    const parentNode = this.getParentNode(indexPath)
    if (!parentNode) return
    const nextIndex = [...indexPath.slice(0, -1), indexPath[indexPath.length - 1] + 1]
    return this._insert(this.rootNode, nextIndex, nodes)
  }

  move = (fromIndexPaths: IndexPath[], toIndexPath: IndexPath): TreeCollection<T> => {
    return this._move(this.rootNode, fromIndexPaths, toIndexPath)
  }

  filter = (predicate: (node: T, indexPath: IndexPath) => boolean): TreeCollection<T> => {
    const filteredRoot = filter(this.rootNode, {
      predicate,
      getChildren: this.getNodeChildren,
      create: this._create,
    })
    return this.copy(filteredRoot)
  }

  toJSON = () => {
    return this.getValues(this.rootNode)
  }
}

export function flattenedToTree<T>(
  nodes: Array<FlatTreeNode<T>>,
  options: TreeCollectionMethods<T> = fallbackMethods,
): TreeCollection<T> {
  if (nodes.length === 0) {
    throw new Error("[zag-js/tree] Cannot create tree from empty flattened array")
  }

  // Find the actual root node (the one with _parent === undefined)
  const rootFlatNode = nodes.find((node) => node._parent === undefined)
  if (!rootFlatNode) {
    throw new Error("[zag-js/tree] No root node found in flattened data")
  }

  // Create node map for quick lookup
  const nodeMap = new Map<number, FlatTreeNode<T>>()
  nodes.forEach((node) => {
    nodeMap.set(node._index, node)
  })

  // Build the tree recursively
  const buildNode = (idx: number): T => {
    const flatNode = nodeMap.get(idx)
    if (!flatNode) return {} as T

    const { _children, _parent, _index, ...cleanNode } = flatNode

    // Recursively build children
    const children: T[] = []
    _children?.forEach((childIndex) => {
      children.push(buildNode(childIndex))
    })

    return {
      ...cleanNode,
      ...(children.length > 0 && { children }),
    } as T
  }

  // Use the actual root node from flattened data
  const rootNode = buildNode(rootFlatNode._index)

  return new TreeCollection({ ...options, rootNode })
}

export function filePathToTree(paths: string[]): TreeCollection<FilePathTreeNode> {
  const rootNode: FilePathTreeNode = {
    label: "",
    value: "ROOT",
    children: [],
  }

  paths.forEach((path) => {
    const parts = path.split("/")
    let currentNode = rootNode

    parts.forEach((part) => {
      let childNode = currentNode.children?.find((child: any) => child.label === part)

      if (!childNode) {
        childNode = {
          value: parts.slice(0, parts.indexOf(part) + 1).join("/"),
          label: part,
        }
        currentNode.children ||= []
        currentNode.children.push(childNode)
      }

      currentNode = childNode
    })
  })

  return new TreeCollection({ rootNode })
}

const fallbackMethods: TreeCollectionMethods<TreeNode> = {
  nodeToValue(node) {
    if (typeof node === "string") return node
    if (isObject(node) && hasProp(node, "value")) return node.value
    return ""
  },
  nodeToString(node) {
    if (typeof node === "string") return node
    if (isObject(node) && hasProp(node, "label")) return node.label
    return fallbackMethods.nodeToValue(node)
  },
  isNodeDisabled(node) {
    if (isObject(node) && hasProp(node, "disabled")) return !!node.disabled
    return false
  },
  nodeToChildren(node) {
    return node.children
  },
  nodeToChildrenCount(node) {
    if (isObject(node) && hasProp(node, "childrenCount")) return node.childrenCount
  },
}
