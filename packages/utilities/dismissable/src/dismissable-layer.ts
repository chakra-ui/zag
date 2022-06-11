import { contains } from "@zag-js/dom-utils"
import { trackEscapeKeydown } from "./escape-keydown"
import { InteractOutsideOptions, trackInteractOutside } from "./interact-outside"
import { Layer, layerStack } from "./layer-stack"
import { assignPointerEvent, clearPointerEvent, disablePointerEventsOutside } from "./pointer-event-outside"

type Container = HTMLElement | HTMLElement[]

export type DismissableElementOptions = Omit<InteractOutsideOptions, "exclude"> & {
  pointerBlocking?: boolean
  onDismiss: () => void
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onInteractOutside?: (event: Event) => void
  excludeContainers?: Container | (() => Container)
}

export function trackDismissableElement(node: HTMLElement | null, options: DismissableElementOptions) {
  if (!node) return

  const { onDismiss, pointerBlocking, excludeContainers } = options

  const layer: Layer = { dismiss: onDismiss, node, pointerBlocking }

  layerStack.add(layer)
  assignPointerEvent()

  function onPointerDownOutside(event: Event) {
    if (layerStack.isBelowPointerBlockingLayer(node!) || layerStack.isInBranch(event.target)) return
    options.onPointerDownOutside?.(event)
    options.onInteractOutside?.(event)
    if (event.defaultPrevented) return
    onDismiss?.()
  }

  function onFocusOutside(event: Event) {
    if (layerStack.isInBranch(event.target)) return
    options.onFocusOutside?.(event)
    options.onInteractOutside?.(event)
    if (event.defaultPrevented) return
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
    const containers = typeof excludeContainers === "function" ? excludeContainers() : excludeContainers
    const inContainers = Array.isArray(containers) ? containers : [containers]
    return inContainers.some((node) => contains(node, target)) || layerStack.isInChildLayer(node!, target)
  }

  const cleanups = [
    pointerBlocking ? disablePointerEventsOutside(node) : undefined,
    trackEscapeKeydown(onEscapeKeyDown),
    trackInteractOutside(node, { onFocusOutside, onPointerDownOutside, exclude }),
  ]

  return () => {
    layerStack.remove(node!)
    // re-assign pointer event to remaining layers
    assignPointerEvent()
    // remove pointer event from removed layer
    clearPointerEvent(node!)
    cleanups.forEach((fn) => fn?.())
  }
}
