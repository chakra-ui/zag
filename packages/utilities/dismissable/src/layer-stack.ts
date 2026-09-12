import { contains, nextTick, getComputedStyle } from "@zag-js/dom-query"

export type LayerType = "dialog" | "popover" | "menu" | "listbox" | (string & {})

export type LayerDismissEventDetail = {
  originalLayer: HTMLElement
  targetLayer: HTMLElement | undefined
  originalIndex: number
  targetIndex: number
}

export type LayerDismissEvent = CustomEvent<LayerDismissEventDetail>

export type LayerStyleTarget = () => HTMLElement | null

export interface Layer {
  dismiss: VoidFunction
  node: HTMLElement
  type: LayerType
  pointerBlocking?: boolean | undefined
  requestDismiss?: ((event: LayerDismissEvent) => void) | undefined
  styleTargets?: LayerStyleTarget[] | undefined
  triggerElements?: (() => Element[]) | undefined
  parent?: HTMLElement | undefined
}

const LAYER_REQUEST_DISMISS_EVENT = "layer:request-dismiss"

export const layerStack = {
  layers: [] as Layer[],
  branches: [] as HTMLElement[],
  recentlyRemoved: new Set<HTMLElement>(),
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
    const nodes = new Set([node])
    let size = 0
    while (size !== nodes.size) {
      size = nodes.size
      for (const layer of this.layers) {
        if (layer.parent && nodes.has(layer.parent)) nodes.add(layer.node)
      }
    }
    return this.layers.filter((layer) => layer.node !== node && nodes.has(layer.node))
  },
  getLayersByType(type: LayerType) {
    return this.layers.filter((layer) => layer.type === type)
  },
  getParentLayerOfType(node: HTMLElement, type: LayerType) {
    let parent = this.layers[this.indexOf(node)]?.parent
    while (parent) {
      const layer = this.layers[this.indexOf(parent)]
      if (!layer) return undefined
      if (layer.type === type) return layer
      parent = layer.parent
    }
    return undefined
  },
  countNestedLayersOfType(node: HTMLElement, type: LayerType) {
    return this.getChildLayers(node).filter((layer) => layer.type === type).length
  },
  isInNestedLayer(node: HTMLElement, target: HTMLElement | EventTarget | null) {
    // Check active nested layers
    const inNested = this.getChildLayers(node).some((layer) => contains(layer.node, target))
    if (inNested) return true

    // During layer removal, treat all focus events as "inside" to prevent cascading dismissals.
    // This handles the race condition where focus moves during cleanup - we don't want parent
    // layers to dismiss just because focus is transitioning from a closing nested layer.
    if (this.recentlyRemoved.size > 0) return true

    return false
  },
  isInBranch(target: HTMLElement | EventTarget | null) {
    return Array.from(this.branches).some((branch) => contains(branch, target))
  },
  resolveParent(layer: Layer): HTMLElement | undefined {
    const parent = this.findParentNode(layer)
    // re-registering a layer resolves it against a stack that already holds its children, and a
    // layer nested in its own child would make the two each other's parent — an endless chain
    const ownsParent = this.getChildLayers(layer.node).some((child) => child.node === parent)
    return ownsParent ? undefined : parent
  },
  findParentNode(layer: Layer): HTMLElement | undefined {
    const containingNode = this.findLayerContaining(layer.node)
    if (containingNode) return containingNode

    const triggerElements = layer.triggerElements?.() ?? []
    if (triggerElements.length) {
      // Nested layers are commonly portalled, so the node alone says nothing about nesting.
      // What does is where the layer was opened from: a trigger inside another layer makes
      // this layer part of it, a trigger outside every layer makes it a sibling.
      return this.findLayerContaining(...triggerElements)
    }

    // Nothing points at an owner (a layer opened without a rendered trigger, say), so fall
    // back to reading the stack as a stack.
    return this.layers[this.count() - 1]?.node
  },
  findLayerContaining(...elements: Array<Element | null>): HTMLElement | undefined {
    for (let index = this.count() - 1; index >= 0; index--) {
      const { node } = this.layers[index]
      if (elements.some((el) => contains(node, el))) return node
    }
    return undefined
  },
  add(layer: Layer) {
    // Idempotent per DOM node: React Strict Mode (and similar races) can register
    // the same layer twice before `remove` runs; duplicates break nested-layer metadata.
    const existingIndex = this.indexOf(layer.node)
    if (existingIndex !== -1) {
      this.layers.splice(existingIndex, 1)
    }
    layer.parent = this.resolveParent(layer)
    this.layers.push(layer)
    this.syncLayers()
  },
  addBranch(node: HTMLElement) {
    this.branches.push(node)
  },
  remove(node: HTMLElement) {
    const index = this.indexOf(node)
    if (index < 0) return

    const layer = this.layers[index]
    layer.styleTargets?.forEach((getTarget) => {
      const target = getTarget()
      if (target) {
        clearLayerStyleMirror(target)
      }
    })

    // Track this node as recently removed to handle focus race conditions
    // during layer cleanup. This prevents parent layers from incorrectly
    // dismissing when focus moves from a closing nested layer.
    this.recentlyRemoved.add(node)

    // Schedule cleanup after two frames to ensure it outlasts any deferred
    // focusin handlers (which also use requestAnimationFrame)
    nextTick(() => this.recentlyRemoved.delete(node))

    // dismiss nested layers
    this.getChildLayers(node).forEach((child) => layerStack.dismiss(child.node, node))

    // a child that outlives this layer (its dismissal was prevented, or is still animating out)
    // is handed over to this layer's own parent, so an ancestor still dismisses it
    this.layers.forEach((child) => {
      if (child.parent === node) child.parent = layer.parent
    })

    // remove this layer. dismissing a child can synchronously remove other layers, so the
    // index is re-read rather than reused
    const currentIndex = this.indexOf(node)
    if (currentIndex !== -1) this.layers.splice(currentIndex, 1)
    this.syncLayers()
  },
  removeBranch(node: HTMLElement) {
    const index = this.branches.indexOf(node)
    if (index >= 0) this.branches.splice(index, 1)
  },
  syncLayers() {
    this.layers.forEach((layer, index) => {
      applyLayerStackMetadata(layer, index, layer.node)
      layer.styleTargets?.forEach((getTarget) => {
        const target = getTarget()
        if (!target || target === layer.node) return
        applyLayerStackMetadata(layer, index, target)
        const { zIndex } = getComputedStyle(layer.node)
        target.style.setProperty("--z-index", zIndex)
      })
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
    while (this.count() > 0) {
      this.remove(this.layers[0].node)
    }
  },
}

function applyLayerStackMetadata(layer: Layer, index: number, el: HTMLElement) {
  el.style.setProperty("--layer-index", `${index}`)

  el.removeAttribute("data-nested")
  el.removeAttribute("data-has-nested")

  const parentOfSameType = layerStack.getParentLayerOfType(layer.node, layer.type)
  if (parentOfSameType) {
    el.setAttribute("data-nested", layer.type)
  }

  const nestedCount = layerStack.countNestedLayersOfType(layer.node, layer.type)
  if (nestedCount > 0) {
    el.setAttribute("data-has-nested", layer.type)
  }

  el.style.setProperty("--nested-layer-count", `${nestedCount}`)
}

function clearLayerStyleMirror(el: HTMLElement) {
  el.style.removeProperty("--layer-index")
  el.style.removeProperty("--nested-layer-count")
  el.style.removeProperty("--z-index")
  el.removeAttribute("data-nested")
  el.removeAttribute("data-has-nested")
}

function fireCustomEvent(el: HTMLElement, type: string, detail?: LayerDismissEventDetail) {
  const win = el.ownerDocument.defaultView || window
  const event = new win.CustomEvent(type, { cancelable: true, bubbles: true, detail })
  return el.dispatchEvent(event)
}

function addListenerOnce(el: HTMLElement, type: string, callback: (event: LayerDismissEvent) => void) {
  el.addEventListener(type, callback as EventListener, { once: true })
}
