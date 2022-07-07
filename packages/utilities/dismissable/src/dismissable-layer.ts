import { contains, getEventTarget } from "@zag-js/dom-utils"
import {
  trackInteractOutside,
  FocusOutsideEvent,
  InteractOutsideEvent,
  PointerDownOutsideEvent,
  InteractOutsideHandlers,
} from "@zag-js/interact-outside"
import { trackEscapeKeydown } from "./escape-keydown"
import { Layer, layerStack } from "./layer-stack"
import { assignPointerEventToLayers, clearPointerEvent, disablePointerEventsOutside } from "./pointer-event-outside"

type Container = HTMLElement | null | Array<HTMLElement | null>

export type DismissableElementHandlers = InteractOutsideHandlers & {
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onInteractOutside?: (event: InteractOutsideEvent) => void
}

export type DismissableElementOptions = DismissableElementHandlers & {
  debug?: boolean
  pointerBlocking?: boolean
  onDismiss: () => void
  exclude?: Container | (() => Container)
}

export function trackDismissableElement(node: HTMLElement | null, options: DismissableElementOptions) {
  if (!node) return

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
    return _containers.some((node) => contains(node, target)) || layerStack.isInNestedLayer(node, target)
  }

  const cleanups = [
    pointerBlocking ? disablePointerEventsOutside(node) : undefined,
    trackEscapeKeydown(onEscapeKeyDown),
    trackInteractOutside(node, { exclude, onFocusOutside, onPointerDownOutside }),
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
