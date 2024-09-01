import { hasProp, isObject } from "@zag-js/utils"
import type { TreeCollectionItem, TreeCollectionMethods, TreeCollectionOptions } from "./types"

export interface TreeNodeOptions {
  value: string
  data?: any
  children?: TreeNodeOptions[]
}

export interface FlatTreeNode {
  value: string
  parentValue?: string
  data?: any
}

export const enum TreeNodePosition {
  SAME = 0,
  PRECEDING = -1,
  FOLLOWING = 1,
}

const fallback: TreeCollectionMethods<any> = {
  itemToValue(data) {
    if (isObject(data) && hasProp(data, "value")) return data.value
    return ""
  },
  itemToChildren(data) {
    if (isObject(data) && hasProp(data, "children")) return data.children
    return []
  },
  isItemDisabled(data) {
    if (isObject(data) && hasProp(data, "disabled")) return !!data.disabled
    return false
  },
}

export class TreeNode<T extends TreeCollectionItem = TreeCollectionItem> {
  data: any
  children: TreeNode[] = []
  value: string
  disabled: boolean
  expanded = false
  selected = false
  parentNode: TreeNode | null = null

  constructor(private options: TreeCollectionOptions<T>) {
    const { data } = options

    this.data = data
    this.value = this.getItemValue()
    this.disabled = this.getItemDisabled()

    const children = this.getItemChildren()
    children?.forEach((child) => {
      this.appendChild(new TreeNode({ ...options, data: child }))
    })
  }

  /**
   * Get node value from data
   */
  getItemValue(): string {
    return this.options.itemToValue?.(this.options.data) ?? fallback.itemToValue(this.options.data)
  }

  /**
   * Get node disabled from data
   */
  getItemDisabled(): boolean {
    return this.options.isItemDisabled?.(this.options.data) ?? fallback.isItemDisabled(this.options.data)
  }

  /**
   * Get children of a node from data
   */
  getItemChildren(): T[] {
    return this.options.itemToChildren?.(this.options.data) ?? fallback.itemToChildren(this.options.data)
  }

  get depth(): number {
    return this.parentNode ? this.parentNode.depth + 1 : 0
  }

  removeChild(value: string): void {
    let index = this.children.findIndex((item) => item.value === value)
    if (index !== -1) this.children.splice(index, 1)
  }

  insertBefore(referenceValue: string, newNode: TreeNode): void {
    let index = this.children.findIndex((item) => item.value === referenceValue)
    if (index === -1) {
      this.children.forEach((child) => child.insertBefore(referenceValue, newNode))
      return
    }

    newNode.parentNode = this
    this.children.splice(index, 0, newNode)
  }

  insertAfter(referenceValue: string, newNode: TreeNode): void {
    let index = this.children.findIndex((item) => item.value === referenceValue)
    if (index === -1) {
      this.children.forEach((child) => child.insertAfter(referenceValue, newNode))
      return
    }
    newNode.parentNode = this
    this.children.splice(index + 1, 0, newNode)
  }

  appendChild(node: TreeNode): void {
    this.children.push(node)
    node.parentNode = this
  }

  insertChild(node: TreeNode, targetValue: string): void {
    let index = this.children.findIndex((item) => item.value === targetValue)

    if (index === -1) {
      this.expanded = true
      this.children.unshift(node)
      node.parentNode = this
    } else {
      this.children[index].insertChild(node, targetValue)
    }
  }

  findNode(value: string): TreeNode | null {
    if (this.value === value) return this
    for (let child of this.children) {
      let node = child.findNode(value)
      if (node) return node
    }
    return null
  }

  isRootNode(): boolean {
    return this.parentNode === null
  }

  isChildNode(): boolean {
    return this.parentNode !== null
  }

  getRootNode(): TreeNode {
    let result = this.parentNode
    while (result && result.parentNode !== null) {
      result = result.parentNode
    }
    return result || this
  }

  sortChildren(compareFn: (a: TreeNode, b: TreeNode) => number) {
    this.children.sort(compareFn)
  }

  hasChildNodes(): boolean {
    return this.children.length > 0
  }

  get firstChild(): TreeNode | null {
    return this.children[0] || null
  }

  get lastChild(): TreeNode | null {
    return this.children[this.children.length - 1] || null
  }

  get siblings(): TreeNode[] {
    return this.parentNode?.children ?? []
  }

  get nextSibling(): TreeNode | null {
    if (!this.parentNode) return null
    let index = this.parentNode.children.findIndex((item) => item.value === this.value)
    return this.parentNode.children[index + 1]
  }

  get previousSibling(): TreeNode | null {
    if (!this.parentNode) return null
    let index = this.parentNode.children.findIndex((item) => item.value === this.value)
    return this.parentNode.children[index - 1]
  }

  replaceChild(value: string, newNode: TreeNode): void {
    let index = this.children.findIndex((item) => item.value === value)
    if (index === -1) return
    newNode.parentNode = this
    this.children.splice(index, 1, newNode)
  }

  clone(): TreeNode {
    const clone = new TreeNode({ ...this.options, data: this.data })
    this.children.forEach((child) => clone.appendChild(child.clone()))
    return clone
  }

  isSameNode(node: TreeNode): boolean {
    return this.value === node.value
  }

  contains(value: string): boolean {
    return this.children.some((item) => item.value === value)
  }

  getNextSibling(node: TreeNode): TreeNode {
    let index = this.children.findIndex((item) => item.value === node.value)
    return this.children[index + 1]
  }

  getPreviousSibling(node: TreeNode): TreeNode {
    let index = this.children.findIndex((item) => item.value === node.value)
    return this.children[index - 1]
  }

  getNodePath(value: string, parentValues: string[] = [this.value]): string[] {
    for (const item of this.children) {
      if (item.value === value) return parentValues
      return item.getNodePath(value, [...parentValues, item.value])
    }
    return parentValues
  }

  remove() {
    this.parentNode?.removeChild(this.value)
  }

  reparentNode(value: string, target: { value: string; depth: number }): void {
    const node = this.findNode(value)
    if (!node) throw new Error(`Node not found for value: ${JSON.stringify(value)}`)

    const path = this.getNodePath(target.value)

    const parentValue = path[target.depth]
    if (!parentValue) throw new Error(`Invalid target depth for ${JSON.stringify(target)}`)

    const parentNode = this.findNode(parentValue)

    node.remove()
    parentNode?.insertAfter(target.value, node)
  }

  toJSON(): any {
    const json: any = {
      value: this.value,
    }

    if (this.hasChildNodes()) {
      json.children = this.children.map((child) => child.toJSON())
    }

    if (this.parentNode) {
      json.parent = this.parentNode.value
    }

    return json
  }

  walk(options: TreeWalkerOptions = {}): TreeWalker {
    return new TreeWalker(this, options)
  }

  /**
   * The returns an relative position of `otherNode` position relative to this node.
   */
  compareNodePosition(otherNode: TreeNode | null): TreeNodePosition {
    if (!otherNode || this.isSameNode(otherNode)) return TreeNodePosition.SAME

    if (this.contains(otherNode.value)) return TreeNodePosition.PRECEDING
    if (otherNode.contains(this.value)) return TreeNodePosition.FOLLOWING

    const nodeAPath = this.getNodePath(otherNode.value)
    const nodeBPath = otherNode.getNodePath(this.value)

    if (nodeAPath.length < nodeBPath.length) return TreeNodePosition.PRECEDING
    if (nodeAPath.length > nodeBPath.length) return TreeNodePosition.FOLLOWING

    let i = 0
    while (i < nodeAPath.length) {
      if (nodeAPath[i] !== nodeBPath[i]) break
      i++
    }

    if (nodeAPath[i] < nodeBPath[i]) return TreeNodePosition.PRECEDING
    if (nodeAPath[i] > nodeBPath[i]) return TreeNodePosition.FOLLOWING

    return TreeNodePosition.SAME
  }

  flatten(): FlatTreeNode[] {
    const flatNodes: FlatTreeNode[] = []
    const walker = this.walk()
    let node = walker.firstChild()
    while (node) {
      flatNodes.push({
        value: node.value,
        parentValue: node.parentNode?.value,
        data: node.data,
      })
      node = walker.nextNode()
    }
    return flatNodes
  }
}

interface TreeWalkerOptions {
  acceptNode?: (node: TreeNode) => boolean
}

class TreeWalker {
  currentNode: TreeNode | null = null
  private acceptNode: (node: TreeNode) => boolean

  constructor(
    root: TreeNode,
    public options: TreeWalkerOptions = {},
  ) {
    this.acceptNode = options.acceptNode || (() => true)
    this.currentNode = root
  }

  firstChild(): TreeNode | null {
    if (!this.currentNode?.hasChildNodes()) return null
    let result: TreeNode | null | undefined = this.currentNode.firstChild
    while (result && !this.acceptNode(result) && result.nextSibling) {
      result = result.nextSibling
    }
    if (!result) return null
    this.currentNode = result
    return this.currentNode
  }

  lastChild(): TreeNode | null {
    if (!this.currentNode?.hasChildNodes()) return null
    let result: TreeNode | null | undefined = this.currentNode.lastChild
    while (result && !this.acceptNode(result) && result.previousSibling) {
      result = result.previousSibling
    }
    if (!result) return null
    this.currentNode = result
    return this.currentNode
  }

  previousSibling(): TreeNode | null {
    let result: TreeNode | null | undefined = this.currentNode?.previousSibling
    while (result && !this.acceptNode(result) && result.previousSibling) {
      result = result.previousSibling
    }
    if (!result) return null
    this.currentNode = result
    return this.currentNode
  }

  nextSibling(): TreeNode | null {
    let result: TreeNode | null | undefined = this.currentNode?.nextSibling
    while (result && !this.acceptNode(result) && result.nextSibling) {
      result = result.nextSibling
    }
    if (!result) return null
    this.currentNode = result
    return this.currentNode
  }

  parentNode(): TreeNode | null {
    if (!this.currentNode) return null
    if (!this.currentNode.parentNode) return null
    this.currentNode = this.currentNode.parentNode
    return this.currentNode
  }

  nextNode(): TreeNode | null {
    if (!this.currentNode) return null
    if (this.currentNode.hasChildNodes()) return this.firstChild()
    if (this.currentNode.nextSibling) return this.nextSibling()
    this.currentNode = this.currentNode.parentNode
    return this.nextSibling()
  }

  previousNode(): TreeNode | null {
    if (!this.currentNode) return null
    if (this.currentNode.previousSibling) return this.previousSibling()
    this.currentNode = this.currentNode.parentNode
    return this.previousSibling()
  }
}
