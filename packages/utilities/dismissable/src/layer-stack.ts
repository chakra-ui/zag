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
  /** A registration reserves its position before its content mounts. */
  node: HTMLElement | null
  /** The owner document is known even while content is pending. */
  document: Document
  onEscapeKeyDown?: ((event: KeyboardEvent) => void) | undefined
  /** The element that opened the layer, used to tell nested layers from unrelated ones. */
  getTriggerEl?: (() => Element | null) | undefined
  type: LayerType
  pointerBlocking?: boolean | undefined
  requestDismiss?: ((event: LayerDismissEvent) => void) | undefined
  styleTargets?: LayerStyleTarget[] | undefined
}

type LayerTarget = Layer | HTMLElement

export type LayerBranch = HTMLElement | (() => HTMLElement | null)

const LAYER_REQUEST_DISMISS_EVENT = "layer:request-dismiss"

export const layerStack = {
  layers: [] as Layer[],
  branches: [] as LayerBranch[],
  recentlyRemoved: new Set<HTMLElement>(),
  count(): number {
    return this.layers.length
  },
  pointerBlockingLayers(doc?: Document): Layer[] {
    return this.layers.filter((layer) => layer.node && layer.pointerBlocking && (!doc || layer.document === doc))
  },
  topMostPointerBlockingLayer(doc?: Document): Layer | undefined {
    return this.pointerBlockingLayers(doc).slice(-1)[0]
  },
  hasPointerBlockingLayer(doc?: Document): boolean {
    return this.pointerBlockingLayers(doc).length > 0
  },
  isBelowPointerBlockingLayer(node: HTMLElement) {
    const index = this.indexOf(node)
    const highestBlockingIndex = this.indexOf(this.topMostPointerBlockingLayer(node.ownerDocument))
    return index < highestBlockingIndex
  },
  isTopMost(node: HTMLElement | null) {
    return !!node && this.topMost(node.ownerDocument)?.node === node
  },
  topMost(doc: Document) {
    return [...this.layers].reverse().find((layer) => layer.document === doc)
  },
  getNestedLayers(target: LayerTarget) {
    const index = this.indexOf(target)
    if (index < 0) return []
    const doc = this.layers[index].document
    return this.layers.slice(index + 1).filter((layer) => layer.document === doc)
  },
  /** Layers that close along with `target`: those whose trigger is inside it or inside another layer it owns. */
  getOwnedLayers(target: LayerTarget) {
    const index = this.indexOf(target)
    if (index < 0) return []

    const parent = this.layers[index]
    const owned: Layer[] = []

    for (const layer of this.layers.slice(index + 1)) {
      if (layer.document !== parent.document) continue
      if (isOpenedFrom(layer, parent, owned)) owned.push(layer)
    }

    return owned
  },
  getLayersByType(type: LayerType) {
    return this.layers.filter((layer) => layer.type === type)
  },
  getNestedLayersByType(target: LayerTarget, type: LayerType) {
    return this.getNestedLayers(target).filter((layer) => layer.type === type)
  },
  getParentLayerOfType(target: LayerTarget, type: LayerType) {
    const index = this.indexOf(target)
    if (index <= 0) return undefined
    const doc = this.layers[index].document
    return this.layers
      .slice(0, index)
      .reverse()
      .find((layer) => layer.type === type && layer.document === doc)
  },
  countNestedLayersOfType(target: LayerTarget, type: LayerType) {
    return this.getNestedLayersByType(target, type).length
  },
  isInNestedLayer(node: HTMLElement, target: HTMLElement | EventTarget | null) {
    // Check active nested layers
    const inNested = this.getNestedLayers(node).some((layer) => contains(layer.node, target))
    if (inNested) return true

    // During layer removal, treat all focus events as "inside" to prevent cascading dismissals.
    // This handles the race condition where focus moves during cleanup - we don't want parent
    // layers to dismiss just because focus is transitioning from a closing nested layer.
    if ([...this.recentlyRemoved].some((removed) => removed.ownerDocument === node.ownerDocument)) return true

    return false
  },
  isInBranch(target: HTMLElement | EventTarget | null) {
    return this.branches.some((branch) => contains(typeof branch === "function" ? branch() : branch, target))
  },
  add(layer: Layer) {
    // Idempotent per DOM node: React Strict Mode (and similar races) can register
    // the same layer twice before `remove` runs; duplicates break nested-layer metadata.
    const existingIndex = layer.node ? this.indexOf(layer.node) : this.layers.indexOf(layer)
    if (existingIndex !== -1) {
      this.layers.splice(existingIndex, 1)
    }
    this.layers.push(layer)
    this.syncLayers()
  },
  attach(layer: Layer, node: HTMLElement | null) {
    if (this.indexOf(layer) < 0) return
    // A stale registration must not remove the replacement when its cleanup runs.
    const duplicate = node ? this.layers.find((item) => item !== layer && item.node === node) : undefined
    if (duplicate) this.layers.splice(this.layers.indexOf(duplicate), 1)
    layer.node = node
    this.syncLayers()
  },
  addBranch(branch: LayerBranch) {
    this.branches.push(branch)
  },
  remove(target: LayerTarget) {
    const index = this.indexOf(target)
    if (index < 0) return

    const layer = this.layers[index]
    const node = layer.node
    const nested = this.getOwnedLayers(layer).map((child) => ({ layer: child, index: this.indexOf(child) }))
    layer.styleTargets?.forEach((getTarget) => {
      const target = getTarget()
      if (target) {
        clearLayerStyleMirror(target)
      }
    })

    // Track this node as recently removed to handle focus race conditions
    // during layer cleanup. This prevents parent layers from incorrectly
    // dismissing when focus moves from a closing nested layer.
    if (node) this.recentlyRemoved.add(node)

    // Schedule cleanup after two frames to ensure it outlasts any deferred
    // focusin handlers (which also use requestAnimationFrame)
    if (node) nextTick(() => this.recentlyRemoved.delete(node))

    // Remove by identity before invoking consumers, which may synchronously remove children.
    this.layers.splice(index, 1)
    nested.forEach((child) =>
      this.dismiss(child.layer, node ?? undefined, { originalIndex: child.index, targetIndex: index }),
    )
    this.syncLayers()
  },
  removeBranch(branch: LayerBranch) {
    const index = this.branches.indexOf(branch)
    if (index >= 0) this.branches.splice(index, 1)
  },
  syncLayers() {
    this.layers.forEach((layer) => {
      const node = layer.node
      if (!node) return
      const doc = layer.document
      const index = this.layers.filter((item) => item.document === doc).indexOf(layer)
      applyLayerStackMetadata(layer, index, node)
      layer.styleTargets?.forEach((getTarget) => {
        const target = getTarget()
        if (!target || target === node) return
        applyLayerStackMetadata(layer, index, target)
        const { zIndex } = getComputedStyle(node)
        target.style.setProperty("--z-index", zIndex)
      })
    })
  },
  indexOf(target: LayerTarget | null | undefined) {
    if (!target) return -1
    return this.layers.findIndex((layer) => layer === target || layer.node === target)
  },
  dismiss(target: LayerTarget, parent?: HTMLElement, indices?: { originalIndex: number; targetIndex: number }) {
    // Create and dispatch the preventable event
    const index = this.indexOf(target)
    if (index === -1) return

    const layer = this.layers[index]
    const node = layer.node
    // DOM request-dismiss events require mounted content. Pending children can still close.
    if (!node) {
      layer.dismiss()
      return
    }

    addListenerOnce(node, LAYER_REQUEST_DISMISS_EVENT, (event) => {
      layer.requestDismiss?.(event)
      if (!event.defaultPrevented) {
        layer?.dismiss()
      }
    })

    fireCustomEvent(node, LAYER_REQUEST_DISMISS_EVENT, {
      originalLayer: node,
      targetLayer: parent,
      originalIndex: indices?.originalIndex ?? index,
      targetIndex: indices?.targetIndex ?? (parent ? this.indexOf(parent) : -1),
    })

    this.syncLayers()
  },
  clear() {
    const first = this.layers[0]
    if (first) this.remove(first)
  },
}

// Without a trigger there's no evidence of ownership, so the layer stays independent.
function isOpenedFrom(layer: Layer, parent: Layer, owned: Layer[]) {
  const trigger = layer.getTriggerEl?.()
  if (!trigger) return false
  return [parent, ...owned].some((owner) => contains(owner.node, trigger))
}

function applyLayerStackMetadata(layer: Layer, index: number, el: HTMLElement) {
  el.style.setProperty("--layer-index", `${index}`)

  el.removeAttribute("data-nested")
  el.removeAttribute("data-has-nested")

  const parentOfSameType = layerStack.getParentLayerOfType(layer, layer.type)
  if (parentOfSameType) {
    el.setAttribute("data-nested", layer.type)
  }

  const nestedCount = layerStack.countNestedLayersOfType(layer, layer.type)
  if (nestedCount > 0) {
    el.setAttribute("data-has-nested", layer.type)
  }

  el.style.setProperty("--nested-layer-count", `${nestedCount}`)
}

function clearLayerStyleMirror(el: HTMLElement) {
  el.style.removeProperty("--layer-index")
  el.style.removeProperty("--nested-layer-count")
  // Preserve stacking while the removed layer animates out.
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
