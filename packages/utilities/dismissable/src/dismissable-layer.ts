import { contains, getEventTarget, isHTMLElement, raf } from "@zag-js/dom-query"
import {
  trackInteractOutside,
  type FocusOutsideEvent,
  type InteractOutsideHandlers,
  type PointerDownOutsideEvent,
} from "@zag-js/interact-outside"
import { isFunction, warn, type MaybeFunction } from "@zag-js/utils"
import { trackEscapeKeydown } from "./escape-keydown"
import { layerStack, type Layer } from "./layer-stack"
import { assignPointerEventToLayers, clearPointerEvent, disablePointerEventsOutside } from "./pointer-event-outside"

type MaybeElement = HTMLElement | null
type Container = MaybeElement | Array<MaybeElement>
type NodeOrFn = MaybeFunction<MaybeElement>

export interface DismissableElementHandlers extends InteractOutsideHandlers {
  /**
   * Function called when the escape key is pressed
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void
}

export interface PersistentElementOptions {
  /**
   * Returns the persistent elements that:
   * - should not have pointer-events disabled
   * - should not trigger the dismiss event
   */
  persistentElements?: Array<() => Element | null>
}

export interface DismissableElementOptions extends DismissableElementHandlers, PersistentElementOptions {
  /**
   * Whether to log debug information
   */
  debug?: boolean
  /**
   * Whether to block pointer events outside the dismissable element
   */
  pointerBlocking?: boolean
  /**
   * Function called when the dismissable element is dismissed
   */
  onDismiss: VoidFunction
  /**
   * Exclude containers from the interact outside event
   */
  exclude?: MaybeFunction<Container>
  /**
   * Defer the interact outside event to the next frame
   */
  defer?: boolean
}

function trackDismissableElementImpl(node: MaybeElement, options: DismissableElementOptions) {
  if (!node) {
    warn("[@zag-js/dismissable] node is `null` or `undefined`")
    return
  }

  const { onDismiss, pointerBlocking, exclude: excludeContainers, debug } = options

  const layer: Layer = { dismiss: onDismiss, node, pointerBlocking }

  layerStack.add(layer)
  assignPointerEventToLayers()

  function onPointerDownOutside(event: PointerDownOutsideEvent) {
    const target = getEventTarget(event.detail.originalEvent)
    if (layerStack.isBelowPointerBlockingLayer(node!) || layerStack.isInBranch(target)) return
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
    if (!layerStack.isTopMost(node!)) return
    options.onEscapeKeyDown?.(event)
    if (!event.defaultPrevented && onDismiss) {
      event.preventDefault()
      onDismiss()
    }
  }

  function exclude(target: Element) {
    if (!node) return false
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
    layerStack.remove(node!)
    // re-assign pointer event to remaining layers
    assignPointerEventToLayers()
    // remove pointer event from removed layer
    clearPointerEvent(node!)
    cleanups.forEach((fn) => fn?.())
  }
}

export function trackDismissableElement(nodeOrFn: NodeOrFn, options: DismissableElementOptions) {
  const { defer } = options
  const func = defer ? raf : (v: any) => v()
  const cleanups: (VoidFunction | undefined)[] = []
  cleanups.push(
    func(() => {
      const node = isFunction(nodeOrFn) ? nodeOrFn() : nodeOrFn
      cleanups.push(trackDismissableElementImpl(node, options))
    }),
  )
  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}

export function trackDismissableBranch(nodeOrFn: NodeOrFn, options: { defer?: boolean } = {}) {
  const { defer } = options
  const func = defer ? raf : (v: any) => v()
  const cleanups: (VoidFunction | undefined)[] = []

  cleanups.push(
    func(() => {
      const node = isFunction(nodeOrFn) ? nodeOrFn() : nodeOrFn
      if (!node) {
        warn("[@zag-js/dismissable] branch node is `null` or `undefined`")
        return
      }
      layerStack.addBranch(node)
      cleanups.push(() => {
        layerStack.removeBranch(node)
      })
    }),
  )

  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}
