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
  /** Layers sharing a group are peers, not ancestors. Used by menubar menus. */
  group?: string | undefined
  /** Elements the layer opened from. When set, it nests only in a layer containing one. */
  origins?: Array<Element | null | undefined> | undefined
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
let cancelClosingAncestors: VoidFunction | undefined

/** Resolved on read, so a layer's blocking can change without re-registering it. */
export function isPointerBlocking(layer: Pick<Layer, "pointerBlocking">): boolean {
  const value = layer.pointerBlocking
  return typeof value === "function" ? value() : !!value
}

function indexById(layers: Layer[]) {
  const byId = new Map<string, Layer>()
  for (const layer of layers) if (layer.id && !byId.has(layer.id)) byId.set(layer.id, layer)
  return byId
}

/** Ancestor ids, nearest first. Stops at a cycle. */
function* ancestorIds(layer: Layer, byId: Map<string, Layer>) {
  const seen = new Set<string>()
  let parentId = layer.parentId
  while (parentId && !seen.has(parentId)) {
    seen.add(parentId)
    yield parentId
    parentId = byId.get(parentId)?.parentId
  }
}

export const layerStack = {
  layers: [] as Layer[],
  branches: [] as HTMLElement[],
  /** Ids of layers whose descendant just closed. */
  closingAncestors: new Set<string>(),
  pendingReattach: new Map<HTMLElement, { id: string | undefined; parentId: string | undefined; index: number }>(),
  count(): number {
    return this.layers.length
  },
  topMostPointerBlockingIndex(): number {
    for (let i = this.count() - 1; i >= 0; i--) {
      if (isPointerBlocking(this.layers[i])) return i
    }
    return -1
  },
  topMostPointerBlockingLayer(): Layer | undefined {
    return this.layers[this.topMostPointerBlockingIndex()]
  },
  hasPointerBlockingLayer(): boolean {
    return this.topMostPointerBlockingIndex() !== -1
  },
  isBelowPointerBlockingLayer(node: HTMLElement) {
    return this.indexOf(node) < this.topMostPointerBlockingIndex()
  },
  isTopMost(node: HTMLElement | null) {
    const layer = this.layers[this.count() - 1]
    return layer?.node === node
  },
  layerFor(node: HTMLElement | null): Layer | undefined {
    return this.layers.find((layer) => layer.node === node)
  },
  parentFor(layer: Layer): Layer | undefined {
    const origins = layer.origins?.filter(Boolean)
    if (!origins) return this.layers[this.count() - 1]
    for (let i = this.count() - 1; i >= 0; i--) {
      const candidate = this.layers[i]
      if (origins.some((origin) => contains(candidate.node, origin))) return candidate
    }
    return undefined
  },
  /** Top-level layers that opened from inside the new layer become its children. */
  adopt(layer: Layer): Layer[] {
    if (!layer.origins) return []
    const adopted = this.layers.filter(
      (other) =>
        !other.parentId &&
        other.origins?.some((origin) => origin && origin !== layer.node && contains(layer.node, origin)),
    )
    adopted.forEach((child) => (child.parentId = layer.id))
    return adopted
  },
  /** The most recently added layer in the same group, if any. */
  peerFor(group: string): Layer | undefined {
    for (let i = this.count() - 1; i >= 0; i--) {
      if (this.layers[i].group === group) return this.layers[i]
    }
    return undefined
  },
  /** Descendants, shallowest first, so a cascade dismisses parents before their own children. */
  getNestedLayers(node: HTMLElement) {
    const id = this.layerFor(node)?.id
    if (!id) return []
    const byId = indexById(this.layers)
    const depth = new Map<Layer, number>()
    for (const layer of this.layers) {
      let level = 0
      for (const ancestorId of ancestorIds(layer, byId)) {
        level++
        if (ancestorId !== id) continue
        depth.set(layer, level)
        break
      }
    }
    return [...depth.keys()].sort((a, b) => depth.get(a)! - depth.get(b)!)
  },
  isInNestedLayer(node: HTMLElement, target: HTMLElement | EventTarget | null) {
    return this.getNestedLayers(node).some((layer) => contains(layer.node, target))
  },
  /** Focus leaving a closing descendant shouldn't dismiss its ancestors. */
  isClosingAncestor(node: HTMLElement) {
    const id = this.layerFor(node)?.id
    return !!id && this.closingAncestors.has(id)
  },
  isInBranch(target: HTMLElement | EventTarget | null) {
    return Array.from(this.branches).some((branch) => contains(branch, target))
  },
  add(layer: Layer) {
    // Strict Mode can register the same node twice
    const existingIndex = this.indexOf(layer.node)
    const existing = existingIndex !== -1 ? this.layers[existingIndex] : undefined

    const pending = this.pendingReattach.get(layer.node)

    if (existing) {
      // Keeps its parent; `undefined` means top level
      layer.id ??= existing.id
      layer.parentId = existing.parentId
    } else if (pending) {
      layer.id ??= pending.id
      layer.parentId = pending.parentId
    } else {
      layer.id ??= `layer-${++layerId}`
      // A peer is a sibling, not an ancestor
      const peer = layer.group ? this.peerFor(layer.group) : undefined
      layer.parentId = peer ? peer.parentId : (layer.parentId ?? this.parentFor(layer)?.id)
    }

    // Children can register first (effects run child-first), so a new layer adopts them
    const adopted = existing || pending ? [] : this.adopt(layer)

    if (existing) {
      // In place, so a parent re-registering doesn't rise above its children
      this.layers[existingIndex] = layer
    } else if (pending) {
      this.pendingReattach.delete(layer.node)
      this.layers.splice(Math.min(pending.index, this.count()), 0, layer)
    } else if (adopted.length) {
      // Below its children, so the innermost stays topmost
      this.layers.splice(this.indexOf(adopted[0].node), 0, layer)
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
      // Re-added right after, so descendants stay
      this.pendingReattach.set(node, { id: layer.id, parentId: layer.parentId, index })
    } else {
      for (const id of ancestorIds(layer, indexById(this.layers))) this.closingAncestors.add(id)
      // One timer per burst, outlasting deferred focusin handlers
      cancelClosingAncestors?.()
      cancelClosingAncestors = nextTick(() => {
        cancelClosingAncestors = undefined
        this.closingAncestors.clear()
      })

      // Deferred, so descendants unmounting in the same pass aren't dismissed
      const nested = this.getNestedLayers(node)
      if (nested.length) queueMicrotask(() => nested.forEach((layer) => this.dismiss(layer.node, node)))
    }

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
    // One walk per chain; per-layer lookups scaled as n^4
    const byId = indexById(this.layers)
    const nestedCounts = new Map<string | undefined, number>()
    const nestedInSameType = new Set<Layer>()
    for (const layer of this.layers) {
      for (const parentId of ancestorIds(layer, byId)) {
        const parent = byId.get(parentId)
        if (!parent) break
        if (parent.type !== layer.type) continue
        nestedCounts.set(parentId, (nestedCounts.get(parentId) ?? 0) + 1)
        nestedInSameType.add(layer)
      }
    }
    const highestBlockingIndex = this.topMostPointerBlockingIndex()

    this.layers.forEach((layer, index) => {
      const nestedCount = nestedCounts.get(layer.id) ?? 0
      const snapshot: LayerSnapshot = {
        active: true,
        type: layer.type,
        index,
        nested: nestedInSameType.has(layer),
        hasNested: nestedCount > 0,
        nestedCount,
        blocked: index < highestBlockingIndex,
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
    const index = this.indexOf(node)
    if (index === -1) return

    const layer = this.layers[index]
    const event = fireCustomEvent(node, LAYER_REQUEST_DISMISS_EVENT, {
      originalLayer: node,
      targetLayer: parent,
      originalIndex: index,
      targetIndex: parent ? this.indexOf(parent) : -1,
    })
    layer.requestDismiss?.(event)
    if (!event.defaultPrevented) layer.dismiss()
    // `remove` syncs after the cascade
  },
}

function publishSnapshot(layer: Layer, snapshot: LayerSnapshot) {
  layer.snapshot = snapshot
  layer.onLayerChange?.(snapshot)
}

function fireCustomEvent(el: HTMLElement, type: string, detail: LayerDismissEventDetail): LayerDismissEvent {
  const win = el.ownerDocument.defaultView || window
  const event = new win.CustomEvent(type, { cancelable: true, bubbles: true, detail })
  el.dispatchEvent(event)
  return event
}
