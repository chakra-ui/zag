export interface TreeNodeOptions {
  value: string
  label?: string
  data?: any
  expanded?: boolean
  selected?: boolean
  children?: TreeNodeOptions[]
}

export class TreeNode {
  data: any
  children: TreeNode[] = []
  label: string
  value: string
  expanded = false
  selected = false
  parentNode: TreeNode | null = null

  constructor(options: TreeNodeOptions) {
    const { data, value, label, expanded, selected, children } = options

    this.data = data
    this.value = value
    this.label = label || value
    this.expanded = !!expanded
    this.selected = !!selected

    children?.forEach((child) => {
      this.appendChild(new TreeNode(child))
    })
  }

  get depth(): number {
    return this.parentNode ? this.parentNode.depth + 1 : 0
  }

  getChildValues() {
    return this.children.map((child) => child.value)
  }

  removeChild(value: string) {
    let index = this.children.findIndex((item) => item.value === value)
    if (index !== -1) this.children.splice(index, 1)
    return index !== -1 ? index : undefined
  }

  insertBefore(referenceValue: string, newNode: TreeNode) {
    let index = this.children.findIndex((item) => item.value === referenceValue)
    if (index === -1) {
      this.children.forEach((child) => child.insertBefore(referenceValue, newNode))
      return
    }

    newNode.parentNode = this
    this.children.splice(index, 0, newNode)
  }

  insertAfter(referenceValue: string, newNode: TreeNode) {
    let index = this.children.findIndex((item) => item.value === referenceValue)
    if (index === -1) {
      this.children.forEach((child) => child.insertAfter(referenceValue, newNode))
      return
    }
    newNode.parentNode = this
    this.children.splice(index + 1, 0, newNode)
  }

  appendChild(node: TreeNode) {
    this.children.push(node)
    node.parentNode = this
  }

  insertChild(node: TreeNode, targetValue: string) {
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

  isRootNode() {
    return this.parentNode === null
  }

  isChildNode() {
    return this.parentNode !== null
  }

  getRootNode(): TreeNode {
    let curr = this.parentNode
    while (curr && curr.parentNode !== null) {
      curr = curr.parentNode
    }
    return curr || this
  }

  sortChildren(compareFn: (a: TreeNode, b: TreeNode) => number) {
    this.children.sort(compareFn)
  }

  hasChildNodes() {
    return this.children.length > 0
  }

  get firstChild() {
    return this.children[0]
  }

  get lastChild() {
    return this.children[this.children.length - 1]
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

  replaceChild(value: string, newNode: TreeNode) {
    let index = this.children.findIndex((item) => item.value === value)
    if (index === -1) return
    newNode.parentNode = this
    this.children.splice(index, 1, newNode)
  }

  clone() {
    const clone = new TreeNode({ value: this.value, label: this.label, data: this.data })
    this.children.forEach((child) => clone.appendChild(child.clone()))
    return clone
  }

  isSameNode(node: TreeNode) {
    return this.value === node.value
  }

  contains(value: string) {
    return this.children.some((item) => item.value === value)
  }

  expand(propagate = false) {
    if (!this.hasChildNodes()) return
    this.expanded = true
    if (propagate) {
      this.children.forEach((child) => child.expand())
    }
  }

  collapse(propagate = false) {
    if (!this.hasChildNodes()) return
    this.expanded = false
    if (propagate) {
      this.children.forEach((child) => child.collapse())
    }
  }

  getNextSibling(node: TreeNode) {
    let index = this.children.findIndex((item) => item.value === node.value)
    return this.children[index + 1]
  }

  getPreviousSibling(node: TreeNode) {
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

  reparentNode(value: string, target: { value: string; depth: number }) {
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
}
