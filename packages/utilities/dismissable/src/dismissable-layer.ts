import { contains, getDocument, getEventTarget, isHTMLElement, raf } from "@zag-js/dom-query"
import {
  trackInteractOutside,
  type FocusOutsideEvent,
  type InteractOutsideHandlers,
  type PointerDownOutsideEvent,
} from "@zag-js/interact-outside"
import { warn, type MaybeFunction } from "@zag-js/utils"
import { trackLayerEscape } from "./layer-escape"
import { layerStack, type Layer, type LayerDismissEvent, type LayerStyleTarget, type LayerType } from "./layer-stack"
import { observeNode } from "./observe-node"
import { assignPointerEventToLayers, clearPointerEvent, disablePointerEventsOutside } from "./pointer-event-outside"

type MaybeElement = HTMLElement | null
type Container = MaybeElement | Array<MaybeElement>
type NodeOrFn = MaybeFunction<MaybeElement>

export interface DismissableElementHandlers extends InteractOutsideHandlers {
  /**
   * Function called when the escape key is pressed
   */
  onEscapeKeyDown?: ((event: KeyboardEvent) => void) | undefined
  /**
   * Function called when this layer is closed due to a parent layer being closed
   */
  onRequestDismiss?: ((event: LayerDismissEvent) => void) | undefined
}

export interface PersistentElementOptions {
  /**
   * Returns the persistent elements that:
   * - should not have pointer-events disabled
   * - should not trigger the dismiss event
   */
  persistentElements?: Array<() => Element | null> | undefined
}

export interface DismissableElementOptions extends DismissableElementHandlers, PersistentElementOptions {
  /** The root containing the content. Used before the content mounts to register Escape. */
  getRootNode?: (() => Document | ShadowRoot | Element) | undefined
  /**
   * The element that opens the layer, such as its trigger. When another layer closes,
   * this layer closes with it only if this element is inside it. Without one, the layer
   * is never closed by another layer closing.
   */
  getTriggerEl?: (() => Element | null) | undefined
  /**
   * Extra elements that receive the same layer stack CSS vars, `data-*`, and `--z-index`
   * (from the primary node's computed `z-index`) as the dismissable node
   * (e.g. dialog backdrop + positioner when the node is content).
   */
  layerStyleTargets?: LayerStyleTarget[] | undefined
  /**
   * Whether to log debug information
   */
  debug?: boolean | undefined
  /**
   * Whether to block pointer events outside the dismissable element
   */
  pointerBlocking?: boolean | undefined
  /**
   * Function called when the dismissable element is dismissed
   */
  onDismiss: VoidFunction
  /**
   * Exclude containers from the interact outside event
   */
  exclude?: MaybeFunction<Container> | undefined
  /**
   * Defer the interact outside event to the next frame
   */
  defer?: boolean | undefined
  /**
   * Whether to warn when the node is `null` or `undefined`
   */
  warnOnMissingNode?: boolean | undefined
  /**
   * The type of layer being tracked
   */
  type?: LayerType | undefined
}

function attachDismissableElement(layer: Layer, node: HTMLElement, options: DismissableElementOptions) {
  const { onDismiss, pointerBlocking, exclude: excludeContainers, debug } = options

  layerStack.attach(layer, node)
  assignPointerEventToLayers()

  function onPointerDownOutside(event: PointerDownOutsideEvent) {
    if (layerStack.indexOf(layer) < 0 || layer.node !== node) return
    const target = getEventTarget(event.detail.originalEvent)
    if (layerStack.isBelowPointerBlockingLayer(node) || layerStack.isInBranch(target)) return
    options.onPointerDownOutside?.(event)
    options.onInteractOutside?.(event)
    if (event.defaultPrevented) return
    if (debug) {
      console.log("onPointerDownOutside:", event.detail.originalEvent)
    }
    onDismiss?.()
  }

  function onFocusOutside(event: FocusOutsideEvent) {
    if (layerStack.indexOf(layer) < 0 || layer.node !== node) return
    const target = getEventTarget(event.detail.originalEvent)
    if (layerStack.isInBranch(target)) return
    options.onFocusOutside?.(event)
    options.onInteractOutside?.(event)
    if (event.defaultPrevented) return
    if (debug) {
      console.log("onFocusOutside:", event.detail.originalEvent)
    }
    onDismiss?.()
  }

  function exclude(target: Element) {
    const containers = typeof excludeContainers === "function" ? excludeContainers() : excludeContainers
    const _containers = Array.isArray(containers) ? containers : [containers]
    const persistentElements = options.persistentElements?.map((fn) => fn()).filter(isHTMLElement)
    if (persistentElements) _containers.push(...persistentElements)
    return _containers.some((node) => contains(node, target)) || layerStack.isInNestedLayer(node, target)
  }

  const cleanups = [
    pointerBlocking
      ? disablePointerEventsOutside(node, options.persistentElements, options.getRootNode?.())
      : undefined,
    trackInteractOutside(node, { exclude, onFocusOutside, onPointerDownOutside, defer: options.defer }),
  ]

  return () => {
    if (layer.node === node) layerStack.attach(layer, null)
    clearPointerEvent(node)
    cleanups.forEach((fn) => fn?.())
    assignPointerEventToLayers()
  }
}

export function trackDismissableElement(nodeOrFn: NodeOrFn, options: DismissableElementOptions) {
  const { warnOnMissingNode = true } = options
  const getNode = () => (typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn)
  const root = options.getRootNode?.() ?? getDocument(getNode())
  const doc = getDocument(root)
  // Kept so ownership survives the trigger being removed along with its parent's content
  const initialTrigger = options.getTriggerEl?.() ?? null
  const layer: Layer = {
    node: null,
    document: doc,
    type: options.type ?? "dialog",
    dismiss: options.onDismiss,
    requestDismiss: options.onRequestDismiss,
    pointerBlocking: options.pointerBlocking,
    styleTargets: options.layerStyleTargets,
    getTriggerEl: () => options.getTriggerEl?.() ?? initialTrigger,
    onEscapeKeyDown(event) {
      options.onEscapeKeyDown?.(event)
      if (event.defaultPrevented) return
      event.preventDefault()
      options.onDismiss()
    },
  }

  // Opening order is independent of rendering order. Escape is live even while node is null.
  layerStack.add(layer)
  const stopEscape = trackLayerEscape(doc)
  const stopNode = observeNode(getNode, {
    attach: (node) => attachDismissableElement(layer, node, options),
    getRootNode: () => root,
    defer: options.defer,
    onMissing: warnOnMissingNode ? () => warn("[@zag-js/dismissable] node is `null` or `undefined`") : undefined,
  })

  let disposed = false
  return () => {
    if (disposed) return
    disposed = true
    layerStack.remove(layer)
    stopEscape()
    stopNode()
  }
}

export function trackDismissableBranch(nodeOrFn: NodeOrFn, options: { defer?: boolean | undefined } = {}) {
  // Resolved at event time, so late mounts and replaced nodes need no observation.
  const getNode = () => (typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn)
  layerStack.addBranch(getNode)
  const checkMissing = () => {
    if (!getNode()) warn("[@zag-js/dismissable] branch node is `null` or `undefined`")
  }
  if (!options.defer) checkMissing()
  const cancelWarning = options.defer ? raf(checkMissing) : undefined
  return () => {
    cancelWarning?.()
    layerStack.removeBranch(getNode)
  }
}
