import { contains, getEventTarget, isHTMLElement, whenNode } from "@zag-js/dom-query"
import {
  trackInteractOutside,
  type FocusOutsideEvent,
  type InteractOutsideHandlers,
  type PointerDownOutsideEvent,
} from "@zag-js/interact-outside"
import { warn, type MaybeFunction } from "@zag-js/utils"
import { trackEscapeKeydown } from "./escape-keydown"
import { layerStack, type Layer, type LayerDismissEvent, type LayerStyleTarget, type LayerType } from "./layer-stack"
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

function trackDismissableElementImpl(node: HTMLElement, options: DismissableElementOptions) {
  const {
    onDismiss,
    onRequestDismiss,
    pointerBlocking,
    exclude: excludeContainers,
    debug,
    type = "dialog",
    layerStyleTargets,
  } = options

  const layer: Layer = {
    dismiss: onDismiss,
    node,
    type,
    pointerBlocking,
    requestDismiss: onRequestDismiss,
    styleTargets: layerStyleTargets,
  }

  layerStack.add(layer)
  assignPointerEventToLayers()

  function onPointerDownOutside(event: PointerDownOutsideEvent) {
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

  function onEscapeKeyDown(event: KeyboardEvent) {
    if (!layerStack.isTopMost(node)) return
    options.onEscapeKeyDown?.(event)
    if (!event.defaultPrevented && onDismiss) {
      event.preventDefault()
      onDismiss()
    }
  }

  function exclude(target: Element) {
    const containers = typeof excludeContainers === "function" ? excludeContainers() : excludeContainers
    const _containers = Array.isArray(containers) ? containers : [containers]
    const persistentElements = options.persistentElements?.map((fn) => fn()).filter(isHTMLElement)
    if (persistentElements) _containers.push(...persistentElements)
    return _containers.some((node) => contains(node, target)) || layerStack.isInNestedLayer(node, target)
  }

  const cleanups = [
    pointerBlocking ? disablePointerEventsOutside(node, options.persistentElements) : undefined,
    trackEscapeKeydown(node, onEscapeKeyDown),
    trackInteractOutside(node, { exclude, onFocusOutside, onPointerDownOutside, defer: options.defer }),
  ]

  return () => {
    layerStack.remove(node)
    // re-assign pointer event to remaining layers
    assignPointerEventToLayers()
    // remove pointer event from removed layer
    clearPointerEvent(node)
    cleanups.forEach((fn) => fn?.())
  }
}

export function trackDismissableElement(nodeOrFn: NodeOrFn, options: DismissableElementOptions) {
  const { warnOnMissingNode = true } = options
  // `defer` gates node resolution only — escape dismissal is dead until the layer is on
  // the stack, so registration must not wait a frame longer than the node does.
  return whenNode(nodeOrFn, (node) => trackDismissableElementImpl(node, options), {
    defer: options.defer,
    onMissing: warnOnMissingNode ? () => warn("[@zag-js/dismissable] node is `null` or `undefined`") : undefined,
  })
}

export function trackDismissableBranch(nodeOrFn: NodeOrFn, options: { defer?: boolean | undefined } = {}) {
  return whenNode(
    nodeOrFn,
    (node) => {
      layerStack.addBranch(node)
      return () => {
        layerStack.removeBranch(node)
      }
    },
    {
      defer: options.defer,
      onMissing: () => warn("[@zag-js/dismissable] branch node is `null` or `undefined`"),
    },
  )
}
