import { contains } from "@zag-js/dom-utils"

export type Layer = {
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
  getChildLayers(node: HTMLElement) {
    return this.layers.slice(this.indexOf(node))
  },
  isInChildLayer(node: HTMLElement, target: HTMLElement | EventTarget | null) {
    return this.getChildLayers(node).some((layer) => contains(layer.node, target))
  },
  isInBranch(target: HTMLElement | EventTarget | null) {
    return [...this.branches].some((branch) => contains(branch, target))
  },
  add(layer: Layer) {
    this.layers.push(layer)
  },
  addBranch(node: HTMLElement) {
    this.branches.push(node)
  },
  remove(node: HTMLElement) {
    const index = this.indexOf(node)
    if (index + 1 < this.count() - 1) {
      this.layers.splice(index, this.count()).forEach((item) => item.dismiss())
    }
    this.layers = this.layers.filter((item) => item.node !== node)
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
