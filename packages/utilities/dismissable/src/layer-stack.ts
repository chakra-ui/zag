import { contains } from "@zag-js/dom-query"

export type LayerType = "dialog" | "popover" | "menu" | "listbox" | (string & {})

export type LayerDismissEventDetail = {
  originalLayer: HTMLElement
  targetLayer: HTMLElement | undefined
  originalIndex: number
  targetIndex: number
}

export type LayerDismissEvent = CustomEvent<LayerDismissEventDetail>

export interface Layer {
  dismiss: VoidFunction
  node: HTMLElement
  type: LayerType
  pointerBlocking?: boolean | undefined
  requestDismiss?: ((event: LayerDismissEvent) => void) | undefined
}

const LAYER_REQUEST_DISMISS_EVENT = "layer:request-dismiss"

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
  getLayersByType(type: LayerType) {
    return this.layers.filter((layer) => layer.type === type)
  },
  getNestedLayersByType(node: HTMLElement, type: LayerType) {
    const index = this.indexOf(node)
    if (index === -1) return []
    return this.layers.slice(index + 1).filter((layer) => layer.type === type)
  },
  getParentLayerOfType(node: HTMLElement, type: LayerType) {
    const index = this.indexOf(node)
    if (index <= 0) return undefined
    return this.layers
      .slice(0, index)
      .reverse()
      .find((layer) => layer.type === type)
  },
  countNestedLayersOfType(node: HTMLElement, type: LayerType) {
    return this.getNestedLayersByType(node, type).length
  },
  isInNestedLayer(node: HTMLElement, target: HTMLElement | EventTarget | null) {
    return this.getNestedLayers(node).some((layer) => contains(layer.node, target))
  },
  isInBranch(target: HTMLElement | EventTarget | null) {
    return Array.from(this.branches).some((branch) => contains(branch, target))
  },
  add(layer: Layer) {
    this.layers.push(layer)
    this.syncLayers()
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
      _layers.forEach((layer) => layerStack.dismiss(layer.node, node))
    }

    // remove this layer
    this.layers.splice(index, 1)
    this.syncLayers()
  },
  removeBranch(node: HTMLElement) {
    const index = this.branches.indexOf(node)
    if (index >= 0) this.branches.splice(index, 1)
  },
  syncLayers() {
    this.layers.forEach((layer, index) => {
      layer.node.style.setProperty("--layer-index", `${index}`)

      // Remove previous data attributes
      layer.node.removeAttribute("data-nested")
      layer.node.removeAttribute("data-has-nested")

      // Check if this layer is nested within another of the same type
      const parentOfSameType = this.getParentLayerOfType(layer.node, layer.type)
      if (parentOfSameType) {
        layer.node.setAttribute("data-nested", layer.type)
      }

      // Check if this layer has nested layers of the same type
      const nestedCount = this.countNestedLayersOfType(layer.node, layer.type)
      if (nestedCount > 0) {
        layer.node.setAttribute("data-has-nested", layer.type)
      }

      // Set the nested layer count
      layer.node.style.setProperty("--nested-layer-count", `${nestedCount}`)
    })
  },
  indexOf(node: HTMLElement | undefined) {
    return this.layers.findIndex((layer) => layer.node === node)
  },
  dismiss(node: HTMLElement, parent?: HTMLElement) {
    // Create and dispatch the preventable event
    const index = this.indexOf(node)
    if (index === -1) return

    const layer = this.layers[index]

    addListenerOnce(node, LAYER_REQUEST_DISMISS_EVENT, (event) => {
      layer.requestDismiss?.(event)
      if (!event.defaultPrevented) {
        layer?.dismiss()
      }
    })

    fireCustomEvent(node, LAYER_REQUEST_DISMISS_EVENT, {
      originalLayer: node,
      targetLayer: parent,
      originalIndex: index,
      targetIndex: parent ? this.indexOf(parent) : -1,
    })

    this.syncLayers()
  },
  clear() {
    this.remove(this.layers[0].node)
  },
}

function fireCustomEvent(el: HTMLElement, type: string, detail?: LayerDismissEventDetail) {
  const win = el.ownerDocument.defaultView || window
  const event = new win.CustomEvent(type, { cancelable: true, bubbles: true, detail })
  return el.dispatchEvent(event)
}

function addListenerOnce(el: HTMLElement, type: string, callback: (event: LayerDismissEvent) => void) {
  el.addEventListener(type, callback as EventListener, { once: true })
}
