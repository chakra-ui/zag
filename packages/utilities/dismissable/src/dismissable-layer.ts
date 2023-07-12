import { contains, getEventTarget, raf } from "@zag-js/dom-query"
import {
  trackInteractOutside,
  type FocusOutsideEvent,
  type InteractOutsideHandlers,
  type PointerDownOutsideEvent,
} from "@zag-js/interact-outside"
import { warn } from "@zag-js/utils"
import { trackEscapeKeydown } from "./escape-keydown"
import { layerStack, type Layer } from "./layer-stack"
import { assignPointerEventToLayers, clearPointerEvent, disablePointerEventsOutside } from "./pointer-event-outside"

type MaybeElement = HTMLElement | null
type Container = MaybeElement | Array<MaybeElement>
type NodeOrFn = MaybeElement | (() => MaybeElement)

export type DismissableElementHandlers = InteractOutsideHandlers & {
  onEscapeKeyDown?: (event: KeyboardEvent) => void
}

export type DismissableElementOptions = DismissableElementHandlers & {
  debug?: boolean
  pointerBlocking?: boolean
  onDismiss: () => void
  exclude?: Container | (() => Container)
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
    return _containers.some((node) => contains(node, target)) || layerStack.isInNestedLayer(node, target)
  }

  const cleanups = [
    pointerBlocking ? disablePointerEventsOutside(node) : undefined,
    trackEscapeKeydown(node, onEscapeKeyDown),
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

export function trackDismissableElement(nodeOrFn: NodeOrFn, options: DismissableElementOptions) {
  const { defer } = options
  const func = defer ? raf : (v: any) => v()
  const cleanups: (VoidFunction | undefined)[] = []
  cleanups.push(
    func(() => {
      const node = typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn
      cleanups.push(trackDismissableElementImpl(node, options))
    }),
  )
  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}
