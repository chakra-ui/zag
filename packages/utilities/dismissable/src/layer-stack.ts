import { contains } from "@zag-js/dom-query"

export interface Layer {
  dismiss: VoidFunction
  node: HTMLElement
  pointerBlocking?: boolean
}

export const layerStack = {
  layers: [] as Layer[],
  branches: [] as HTMLElement[],
  count(): number {
    return this.layers.length
  },
  pointerBlockingLayers(): Layer[] {
    return this.layers.filter((layer) => layer.pointerBlocking)
  },
  topMostPointerBlockingLayer(): Layer | undefined {
    return [...this.pointerBlockingLayers()].slice(-1)[0]
  },
  hasPointerBlockingLayer(): boolean {
    return this.pointerBlockingLayers().length > 0
  },
  isBelowPointerBlockingLayer(node: HTMLElement) {
    const index = this.indexOf(node)
    const highestBlockingIndex = this.topMostPointerBlockingLayer()
      ? this.indexOf(this.topMostPointerBlockingLayer()?.node)
      : -1
    return index < highestBlockingIndex
  },
  isTopMost(node: HTMLElement | null) {
    const layer = this.layers[this.count() - 1]
    return layer?.node === node
  },
  getNestedLayers(node: HTMLElement) {
    return Array.from(this.layers).slice(this.indexOf(node) + 1)
  },
  isInNestedLayer(node: HTMLElement, target: HTMLElement | EventTarget | null) {
    return this.getNestedLayers(node).some((layer) => contains(layer.node, target))
  },
  isInBranch(target: HTMLElement | EventTarget | null) {
    return Array.from(this.branches).some((branch) => contains(branch, target))
  },
  add(layer: Layer) {
    const num = this.layers.push(layer)
    layer.node.style.setProperty("--layer-index", `${num}`)
  },
  addBranch(node: HTMLElement) {
    this.branches.push(node)
  },
  remove(node: HTMLElement) {
    const index = this.indexOf(node)
    if (index < 0) return

    // dismiss nested layers
    if (index < this.count() - 1) {
      const _layers = this.getNestedLayers(node)
      _layers.forEach((layer) => layer.dismiss())
    }
    // remove this layer
    this.layers.splice(index, 1)
    node.style.removeProperty("--layer-index")
  },
  removeBranch(node: HTMLElement) {
    const index = this.branches.indexOf(node)
    if (index >= 0) this.branches.splice(index, 1)
  },
  indexOf(node: HTMLElement | undefined) {
    return this.layers.findIndex((layer) => layer.node === node)
  },
  dismiss(node: HTMLElement) {
    this.layers[this.indexOf(node)]?.dismiss()
  },
  clear() {
    this.remove(this.layers[0].node)
  },
}
