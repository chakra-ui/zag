import { contains, nextTick } from "@zag-js/dom-query"
import { isEqual } from "@zag-js/utils"

export type LayerType = "dialog" | "popover" | "menu" | "listbox" | (string & {})

export type LayerDismissEventDetail = {
  originalLayer: HTMLElement
  targetLayer: HTMLElement | undefined
  originalIndex: number
  targetIndex: number
}

export type LayerDismissEvent = CustomEvent<LayerDismissEventDetail>

export interface LayerSnapshot {
  active: boolean
  type: LayerType
  index: number
  nested: boolean
  hasNested: boolean
  nestedCount: number
  blocked: boolean
}

export interface Layer {
  /** Assigned on first registration. */
  id?: string | undefined
  /** The layer this one opened inside. Captured once and kept across re-registration. */
  parentId?: string | undefined
  dismiss: VoidFunction
  node: HTMLElement
  type: LayerType
  pointerBlocking?: boolean | (() => boolean) | undefined
  requestDismiss?: ((event: LayerDismissEvent) => void) | undefined
  onLayerChange?: ((snapshot: LayerSnapshot) => void) | undefined
  snapshot?: LayerSnapshot | undefined
}

const LAYER_REQUEST_DISMISS_EVENT = "layer:request-dismiss"

let layerId = 0

/** Resolved on read, so a layer's blocking can change without re-registering it. */
export function isPointerBlocking(layer: Pick<Layer, "pointerBlocking">): boolean {
  const value = layer.pointerBlocking
  return typeof value === "function" ? value() : !!value
}

export const layerStack = {
  layers: [] as Layer[],
  branches: [] as HTMLElement[],
  recentlyRemoved: new Set<HTMLElement>(),
  pendingReattach: new Map<HTMLElement, { id: string | undefined; parentId: string | undefined; index: number }>(),
  count(): number {
    return this.layers.length
  },
  pointerBlockingLayers(): Layer[] {
    return this.layers.filter(isPointerBlocking)
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
  layerFor(node: HTMLElement | null): Layer | undefined {
    return this.layers.find((layer) => layer.node === node)
  },
  isDescendantOf(layer: Layer, ancestorId: string | undefined): boolean {
    if (!ancestorId) return false
    // `seen` guards against a malformed chain; a cycle would otherwise spin forever
    const seen = new Set<string>()
    let parentId = layer.parentId
    while (parentId && !seen.has(parentId)) {
      if (parentId === ancestorId) return true
      seen.add(parentId)
      parentId = this.layers.find((l) => l.id === parentId)?.parentId
    }
    return false
  },
  depthOf(layer: Layer): number {
    const seen = new Set<string>()
    let depth = 0
    let parentId = layer.parentId
    while (parentId && !seen.has(parentId)) {
      depth++
      seen.add(parentId)
      parentId = this.layers.find((l) => l.id === parentId)?.parentId
    }
    return depth
  },
  /** Descendants, shallowest first, so a cascade dismisses parents before their own children. */
  getNestedLayers(node: HTMLElement) {
    const id = this.layerFor(node)?.id
    if (!id) return []
    return this.layers
      .filter((layer) => this.isDescendantOf(layer, id))
      .sort((a, b) => this.depthOf(a) - this.depthOf(b))
  },
  getLayersByType(type: LayerType) {
    return this.layers.filter((layer) => layer.type === type)
  },
  getNestedLayersByType(node: HTMLElement, type: LayerType) {
    return this.getNestedLayers(node).filter((layer) => layer.type === type)
  },
  getParentLayerOfType(node: HTMLElement, type: LayerType) {
    const seen = new Set<string>()
    let parentId = this.layerFor(node)?.parentId
    while (parentId && !seen.has(parentId)) {
      const parent = this.layers.find((l) => l.id === parentId)
      if (!parent) return undefined
      if (parent.type === type) return parent
      seen.add(parentId)
      parentId = parent.parentId
    }
    return undefined
  },
  countNestedLayersOfType(node: HTMLElement, type: LayerType) {
    return this.getNestedLayersByType(node, type).length
  },
  isInNestedLayer(node: HTMLElement, target: HTMLElement | EventTarget | null) {
    // Check active nested layers
    const inNested = this.getNestedLayers(node).some((layer) => contains(layer.node, target))
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
  add(layer: Layer) {
    // Idempotent per DOM node: React Strict Mode (and similar races) can register
    // the same layer twice before `remove` runs; duplicates break nested-layer metadata.
    const existingIndex = this.indexOf(layer.node)
    const existing = existingIndex !== -1 ? this.layers[existingIndex] : undefined

    const pending = this.pendingReattach.get(layer.node)

    if (existing) {
      // re-registering keeps its identity and parent, so reconfiguring cannot reparent it.
      // assigned rather than defaulted: `undefined` is a real value meaning "top level"
      layer.id ??= existing.id
      layer.parentId = existing.parentId
    } else if (pending) {
      layer.id ??= pending.id
      layer.parentId = pending.parentId
    } else {
      layer.id ??= `layer-${++layerId}`
      layer.parentId ??= this.layers[this.count() - 1]?.id
    }

    if (existingIndex !== -1) {
      this.layers.splice(existingIndex, 1)
    }

    if (pending) {
      this.pendingReattach.delete(layer.node)
      // back where it was, so `isTopMost` and pointer-blocking order are unchanged
      this.layers.splice(Math.min(pending.index, this.count()), 0, layer)
    } else {
      this.layers.push(layer)
    }

    this.syncLayers()
  },
  addBranch(node: HTMLElement) {
    this.branches.push(node)
  },
  remove(node: HTMLElement, options?: { reattach?: boolean }) {
    const index = this.indexOf(node)
    if (index < 0) return

    const layer = this.layers[index]

    if (options?.reattach) {
      // detached only to be re-added; keep descendants and skip the focus race guard
      this.pendingReattach.set(node, { id: layer.id, parentId: layer.parentId, index })
    } else {
      // Track this node as recently removed to handle focus race conditions
      // during layer cleanup. This prevents parent layers from incorrectly
      // dismissing when focus moves from a closing nested layer.
      this.recentlyRemoved.add(node)

      // Schedule cleanup after two frames to ensure it outlasts any deferred
      // focusin handlers (which also use requestAnimationFrame)
      nextTick(() => this.recentlyRemoved.delete(node))

      // dismiss nested layers
      this.getNestedLayers(node).forEach((nested) => layerStack.dismiss(nested.node, node))
    }

    // remove this layer
    this.layers.splice(index, 1)

    if (layer.snapshot) {
      publishSnapshot(layer, { ...layer.snapshot, active: false, blocked: false })
    }

    this.syncLayers()
  },
  removeBranch(node: HTMLElement) {
    const index = this.branches.indexOf(node)
    if (index >= 0) this.branches.splice(index, 1)
  },
  syncLayers() {
    this.layers.forEach((layer, index) => {
      const parentOfSameType = layerStack.getParentLayerOfType(layer.node, layer.type)
      const nestedCount = layerStack.countNestedLayersOfType(layer.node, layer.type)
      const snapshot: LayerSnapshot = {
        active: true,
        type: layer.type,
        index,
        nested: parentOfSameType != null,
        hasNested: nestedCount > 0,
        nestedCount,
        blocked: layerStack.isBelowPointerBlockingLayer(layer.node),
      }

      if (!isEqual(layer.snapshot, snapshot)) {
        publishSnapshot(layer, snapshot)
      }
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

function publishSnapshot(layer: Layer, snapshot: LayerSnapshot) {
  layer.snapshot = snapshot
  layer.onLayerChange?.(snapshot)
}

function fireCustomEvent(el: HTMLElement, type: string, detail?: LayerDismissEventDetail) {
  const win = el.ownerDocument.defaultView || window
  const event = new win.CustomEvent(type, { cancelable: true, bubbles: true, detail })
  return el.dispatchEvent(event)
}

function addListenerOnce(el: HTMLElement, type: string, callback: (event: LayerDismissEvent) => void) {
  el.addEventListener(type, callback as EventListener, { once: true })
}
