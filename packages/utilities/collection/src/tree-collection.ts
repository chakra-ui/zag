import { compact, hasProp, isEqual, isObject } from "@zag-js/utils"
import {
  access,
  compareIndexPaths,
  find,
  findIndexPath,
  flatMap,
  insert,
  move,
  remove,
  replace,
  visit,
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

  isEqual = (other: TreeCollection<T>) => {
    return isEqual(this.rootNode, other.rootNode)
  }

  getNodeChildren = (node: T) => {
    return this.options.nodeToChildren?.(node) ?? fallback.nodeToChildren(node) ?? []
  }

  getNodeValue = (node: T) => {
    return this.options.nodeToValue?.(node) ?? fallback.nodeToValue(node)
  }

  getNodeDisabled = (node: T) => {
    return this.options.isNodeDisabled?.(node) ?? fallback.isNodeDisabled(node)
  }

  stringify = (value: string) => {
    const node = this.findNode(value)
    if (!node) return null
    return this.stringifyNode(node)
  }

  stringifyNode = (node: T) => {
    return this.options.nodeToString?.(node) ?? fallback.nodeToString(node)
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

  at = (indexPath: number[]) => {
    return access(this.rootNode, indexPath, { getChildren: this.getNodeChildren })
  }

  findNode = (value: string, rootNode = this.rootNode): T | undefined => {
    return find(rootNode, {
      getChildren: this.getNodeChildren,
      predicate: (node) => this.getNodeValue(node) === value,
    })
  }

  sort = (values: string[]) => {
    return values
      .reduce(
        (acc, value) => {
          const indexPath = this.getIndexPath(value)
          if (indexPath != null) acc.push({ value, indexPath })
          return acc
        },
        [] as { value: string; indexPath: number[] }[],
      )
      .sort((a, b) => compareIndexPaths(a.indexPath, b.indexPath))
      .map(({ value }) => value)
  }

  getIndexPath = (value: string) => {
    return findIndexPath(this.rootNode, {
      getChildren: this.getNodeChildren,
      predicate: (node) => this.getNodeValue(node) === value,
    })
  }

  getValuePath = (indexPath: number[] | undefined) => {
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

  contains = (parentIndexPath: number[], valueIndexPath: number[]) => {
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

  getParentNodes = (values: string): T[] => {
    const result: T[] = []
    let indexPath = this.getIndexPath(values)
    while (indexPath && indexPath.length > 0) {
      indexPath.pop()
      const parentNode = this.at(indexPath)
      if (parentNode && !this.isRootNode(parentNode)) {
        result.unshift(parentNode)
      }
    }
    return result
  }

  private getParentIndexPath = (indexPath: number[]): number[] => {
    return indexPath.slice(0, -1)
  }

  getParentNode = (valueOrIndexPath: string | number[]): T | undefined => {
    const indexPath = typeof valueOrIndexPath === "string" ? this.getIndexPath(valueOrIndexPath) : valueOrIndexPath
    return indexPath ? this.at(indexPath.slice(0, -1)) : undefined
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

  getPreviousSibling = (indexPath: number[]): T | undefined => {
    const parentPath = this.getParentIndexPath(indexPath)
    if (!parentPath) return undefined

    const currentIndex = indexPath[indexPath.length - 1]
    if (currentIndex === 0) return undefined

    const previousPath = [...parentPath, currentIndex - 1]
    return this.at(previousPath)
  }

  getNextSibling = (indexPath: number[]): T | undefined => {
    const parentPath = this.getParentIndexPath(indexPath)
    if (!parentPath) return undefined

    const currentIndex = indexPath[indexPath.length - 1]
    const siblings = this.getNodeChildren(this.at(parentPath))
    if (currentIndex >= siblings.length - 1) return undefined

    const nextPath = [...parentPath, currentIndex + 1]
    return this.at(nextPath)
  }

  getSiblingNodes = (indexPath: number[]): T[] => {
    const parentNode = this.getParentNode(indexPath)
    if (!parentNode) return []
    return this.getNodeChildren(parentNode)
  }

  getValues = (rootNode = this.rootNode): string[] => {
    const values = flatMap(rootNode, {
      getChildren: this.getNodeChildren,
      transform: (node) => [this.getNodeValue(node)],
    })
    // remove the root node
    return values.slice(1)
  }

  private isSameDepth = (indexPath: number[], depth?: number): boolean => {
    if (depth == null) return true
    return indexPath.length === depth
  }

  isBranchNode = (node: T) => {
    return this.getNodeChildren(node).length > 0
  }

  getBranchValues = (rootNode = this.rootNode, opts: TreeSkipOptions<T> & { depth?: number } = {}): string[] => {
    let values: string[] = []
    visit(rootNode, {
      getChildren: this.getNodeChildren,
      onEnter: (node, indexPath) => {
        const nodeValue = this.getNodeValue(node)
        if (opts.skip?.({ value: nodeValue, node, indexPath })) return "skip"
        if (this.getNodeChildren(node).length > 0 && this.isSameDepth(indexPath, opts.depth)) {
          values.push(this.getNodeValue(node))
        }
      },
    })
    // remove the root node
    return values.slice(1)
  }

  flatten = (rootNode = this.rootNode): FlatTreeNode[] => {
    const nodes = flatMap(rootNode, {
      getChildren: this.getNodeChildren,
      transform: (node, indexPath): FlatTreeNode[] => {
        const children = this.getNodeChildren(node).map((child) => this.getNodeValue(child))
        return [
          compact({
            label: this.stringifyNode(node),
            value: this.getNodeValue(node),
            indexPath,
            children: children.length > 0 ? children : undefined,
          }),
        ]
      },
    })
    // remove the root node
    return nodes.slice(1)
  }

  private _create = (node: T, children: T[]) => {
    return compact({ ...node, children: children })
  }

  private _insert = (rootNode: T, indexPath: number[], nodes: T[]) => {
    return insert(rootNode, { at: indexPath, nodes, getChildren: this.getNodeChildren, create: this._create })
  }

  private _replace = (rootNode: T, indexPath: number[], node: T) => {
    return replace(rootNode, { at: indexPath, node, getChildren: this.getNodeChildren, create: this._create })
  }

  private _move = (rootNode: T, indexPaths: number[][], to: number[]) => {
    return move(rootNode, { indexPaths, to, getChildren: this.getNodeChildren, create: this._create })
  }

  private _remove = (rootNode: T, indexPaths: number[][]) => {
    return remove(rootNode, { indexPaths, getChildren: this.getNodeChildren, create: this._create })
  }

  replace = (indexPath: number[], node: T) => {
    return this._replace(this.rootNode, indexPath, node)
  }

  remove = (indexPaths: number[][]) => {
    return this._remove(this.rootNode, indexPaths)
  }

  insertBefore = (indexPath: number[], nodes: T[]) => {
    const parentIndexPath = indexPath.slice(0, -1)
    const parentNode = this.at(parentIndexPath)
    if (!parentNode) return
    return this._insert(this.rootNode, indexPath, nodes)
  }

  insertAfter = (indexPath: number[], nodes: T[]) => {
    const parentIndexPath = indexPath.slice(0, -1)
    const parentNode = this.at(parentIndexPath)
    if (!parentNode) return
    const nextIndex = [...parentIndexPath, indexPath[indexPath.length - 1] + 1]
    return this._insert(this.rootNode, nextIndex, nodes)
  }

  move = (fromIndexPaths: number[][], toIndexPath: number[]) => {
    return this._move(this.rootNode, fromIndexPaths, toIndexPath)
  }

  json = () => {
    return this.getValues(this.rootNode)
  }
}

export function flattenedToTree(nodes: FlatTreeNode[]) {
  let rootNode = {
    value: "ROOT",
  }

  nodes.map((node) => {
    const { indexPath, label, value } = node
    if (!indexPath.length) {
      Object.assign(rootNode, { label, value, children: [] })
      return
    }

    rootNode = insert(rootNode, {
      at: indexPath,
      nodes: [compact({ label, value }) as any],
      getChildren: (node) => node.children ?? [],
      create: (node, children) => {
        return compact({ ...node, children })
      },
    })
  })

  return new TreeCollection({ rootNode })
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

const fallback: TreeCollectionMethods<TreeNode> = {
  nodeToValue(node) {
    if (typeof node === "string") return node
    if (isObject(node) && hasProp(node, "value")) return node.value
    return ""
  },
  nodeToString(node) {
    if (typeof node === "string") return node
    if (isObject(node) && hasProp(node, "label")) return node.label
    return fallback.nodeToValue(node)
  },
  isNodeDisabled(node) {
    if (isObject(node) && hasProp(node, "disabled")) return !!node.disabled
    return false
  },
  nodeToChildren(node) {
    return node.children
  },
}
