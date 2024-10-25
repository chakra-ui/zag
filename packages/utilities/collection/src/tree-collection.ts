import { compact, hasProp, isObject } from "@zag-js/utils"
import { access, find, findIndexPath, flatMap, insert, visit } from "tree-visit"

export class TreeCollection<T> {
  items: T

  constructor(private options: TreeCollectionOptions<T>) {
    this.items = options.items
  }

  getItemChildren = (node: T) => {
    return this.options.itemToChildren?.(node) ?? fallback.itemToChildren(node) ?? []
  }

  getItemValue = (node: T) => {
    return this.options.itemToValue?.(node) ?? fallback.itemToValue(node)
  }

  getItemDisabled = (node: T) => {
    return this.options.isItemDisabled?.(node) ?? fallback.isItemDisabled(node)
  }

  stringify = (node: T) => {
    return this.options.itemToString?.(node) ?? fallback.itemToString(node)
  }

  getFirstNode = (items = this.items): T | undefined => {
    let firstChild: T | undefined
    visit(items, {
      getChildren: this.getItemChildren,
      onEnter: (node, indexPath) => {
        if (!firstChild && indexPath.length > 0 && !this.getItemDisabled(node)) {
          firstChild = node
          return "stop"
        }
      },
    })
    return firstChild
  }

  getLastNode = (items = this.items, opts: SkipProperty<T> = {}): T | undefined => {
    let lastChild: T | undefined
    visit(items, {
      getChildren: this.getItemChildren,
      onEnter: (node, indexPath) => {
        if (opts.skip?.(this.getItemValue(node), node, indexPath)) return "skip"
        if (indexPath.length > 1) return "skip"
        if (!this.getItemDisabled(node)) {
          lastChild = node
        }
      },
    })
    return lastChild
  }

  at(indexPath: number[]) {
    return access(this.items, indexPath, { getChildren: this.getItemChildren })
  }

  findNode = (value: string, items = this.items): T | undefined => {
    return find(items, {
      getChildren: this.getItemChildren,
      predicate: (node) => this.getItemValue(node) === value,
    })
  }

  getIndexPath = (value: string) => {
    return findIndexPath(this.items, {
      getChildren: this.getItemChildren,
      predicate: (node) => this.getItemValue(node) === value,
    })
  }

  getValuePath = (value: string) => {
    const indexPath = this.getIndexPath(value)
    if (!indexPath) return []

    const valuePath: string[] = []
    let currentPath = [...indexPath]

    while (currentPath.length > 0) {
      const node = this.at(currentPath)
      if (node) valuePath.unshift(this.getItemValue(node))
      currentPath.pop()
    }

    return valuePath
  }

  getDepth = (value: string) => {
    const indexPath = findIndexPath(this.items, {
      getChildren: this.getItemChildren,
      predicate: (node) => this.getItemValue(node) === value,
    })
    return indexPath?.length ?? 0
  }

  getNextNode = (value: string, opts: SkipProperty<T> = {}): T | undefined => {
    let current = false
    let nextNode: T | undefined
    visit(this.items, {
      getChildren: this.getItemChildren,
      onEnter: (node, indexPath) => {
        if (opts.skip?.(this.getItemValue(node), node, indexPath)) return "skip"

        if (current && !this.getItemDisabled(node)) {
          nextNode = node
          return "stop"
        }

        if (this.getItemValue(node) === value) {
          current = true
        }
      },
    })
    return nextNode
  }

  getPreviousNode = (value: string, opts: SkipProperty<T> = {}): T | undefined => {
    let previousNode: T | undefined
    let found = false
    visit(this.items, {
      getChildren: this.getItemChildren,
      onEnter: (node, indexPath) => {
        if (opts.skip?.(this.getItemValue(node), node, indexPath)) return "skip"

        if (this.getItemValue(node) === value) {
          found = true
          return "stop"
        }

        if (!this.getItemDisabled(node)) {
          previousNode = node
        }
      },
    })
    return found ? previousNode : undefined
  }

  getParentNode = (value: string): T | undefined => {
    const parent = findIndexPath(this.items, {
      getChildren: this.getItemChildren,
      predicate: (node) => this.getItemValue(node) === value,
    })
    return parent ? this.at(parent.slice(0, -1)) : undefined
  }

  getValues = (items = this.items) => {
    const values = flatMap(items, {
      getChildren: this.getItemChildren,
      transform: (node) => [this.getItemValue(node)],
    })
    // remove the root node
    return values.slice(1)
  }

  private isSameDepth = (indexPath: number[], depth?: number) => {
    if (depth == null) return true
    return indexPath.length === depth
  }

  getBranchValues = (items = this.items, opts: SkipProperty<T> & { depth?: number } = {}) => {
    let values: string[] = []
    visit(items, {
      getChildren: this.getItemChildren,
      onEnter: (node, indexPath) => {
        if (opts.skip?.(this.getItemValue(node), node, indexPath)) return "skip"

        if (this.getItemChildren(node).length > 0 && this.isSameDepth(indexPath, opts.depth)) {
          values.push(this.getItemValue(node))
        }
      },
    })
    // remove the root node
    return values.slice(1)
  }

  flatten = (items = this.items) => {
    return flatMap(items, {
      getChildren: this.getItemChildren,
      transform: (node, indexPath): FlattedTreeItem[] => {
        const children = this.getItemChildren(node).map((child) => this.getItemValue(child))
        return [
          compact({
            label: this.stringify(node),
            value: this.getItemValue(node),
            indexPath,
            children: children.length > 0 ? children : undefined,
          }),
        ]
      },
    })
  }
}

export function flattenedToTree(items: FlattedTreeItem[]) {
  let rootNode = {
    value: "ROOT",
  }

  items.map((item) => {
    const { indexPath, label, value } = item
    if (!indexPath.length) {
      Object.assign(rootNode, { label, value, children: [] })
      return
    }

    rootNode = insert(rootNode, {
      at: indexPath,
      nodes: [compact({ label, value }) as any],
      getChildren: (node) => node.children ?? [],
      create: (node, children) => {
        return compact({ ...node, children: children })
      },
    })
  })

  return new TreeCollection({
    items: rootNode,
  })
}

export function filePathToTree(paths: string[]) {
  const rootNode: any = {
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

  return new TreeCollection({
    items: rootNode,
  })
}

export interface TreeCollectionMethods<T> {
  isItemDisabled: (node: T) => boolean
  itemToValue: (node: T) => string
  itemToString: (node: T) => string
  itemToChildren: (node: T) => any[]
}

export interface TreeCollectionOptions<T> extends Partial<TreeCollectionMethods<T>> {
  items: T
}

interface FlattedTreeItem {
  label?: string | undefined
  value: string | undefined
  indexPath: number[]
  children?: string[] | undefined
}

interface SkipProperty<T> {
  skip?: (value: string, node: T, indexPath: number[]) => boolean
}

const fallback: TreeCollectionMethods<any> = {
  itemToValue(item) {
    if (typeof item === "string") return item
    if (isObject(item) && hasProp(item, "value")) return item.value
    return ""
  },
  itemToString(item) {
    if (typeof item === "string") return item
    if (isObject(item) && hasProp(item, "label")) return item.label
    return fallback.itemToValue(item)
  },
  isItemDisabled(item) {
    if (isObject(item) && hasProp(item, "disabled")) return !!item.disabled
    return false
  },
  itemToChildren(node) {
    return node.children
  },
}
