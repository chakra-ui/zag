import { addDomEvent, fireCustomEvent, isContextMenuEvent } from "@zag-js/dom-event"
import {
  contains,
  getDocument,
  getEventTarget,
  getNearestOverflowAncestor,
  getWindow,
  isFocusable,
  isHTMLElement,
  raf,
} from "@zag-js/dom-query"
import { callAll } from "@zag-js/utils"
import { getParentWindow, getWindowFrames } from "./frame-utils"

export interface InteractOutsideHandlers {
  /**
   * Function called when the pointer is pressed down outside the component
   */
  onPointerDownOutside?: ((event: PointerDownOutsideEvent) => void) | undefined
  /**
   * Function called when the focus is moved outside the component
   */
  onFocusOutside?: ((event: FocusOutsideEvent) => void) | undefined
  /**
   * Function called when an interaction happens outside the component
   */
  onInteractOutside?: ((event: InteractOutsideEvent) => void) | undefined
}

export interface InteractOutsideOptions extends InteractOutsideHandlers {
  exclude?: ((target: HTMLElement) => boolean) | undefined
  defer?: boolean | undefined
}

export interface EventDetails<T> {
  originalEvent: T
  contextmenu: boolean
  focusable: boolean
}

const POINTER_OUTSIDE_EVENT = "pointerdown.outside"
const FOCUS_OUTSIDE_EVENT = "focus.outside"

export type PointerDownOutsideEvent = CustomEvent<EventDetails<PointerEvent>>

export type FocusOutsideEvent = CustomEvent<EventDetails<FocusEvent>>

export type InteractOutsideEvent = PointerDownOutsideEvent | FocusOutsideEvent

export type MaybeElement = HTMLElement | null | undefined
export type NodeOrFn = MaybeElement | (() => MaybeElement)

function isComposedPathFocusable(composedPath: EventTarget[]) {
  for (const node of composedPath) {
    if (isHTMLElement(node) && isFocusable(node)) return true
  }
  return false
}

const isPointerEvent = (event: Event): event is PointerEvent => "clientY" in event

function isEventPointWithin(node: MaybeElement, event: Event) {
  if (!isPointerEvent(event) || !node) return false

  const rect = node.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return false

  return (
    rect.top <= event.clientY &&
    event.clientY <= rect.top + rect.height &&
    rect.left <= event.clientX &&
    event.clientX <= rect.left + rect.width
  )
}

function isEventWithinScrollbar(event: Event, target: HTMLElement): boolean {
  if (!target || !isPointerEvent(event)) return false

  const isScrollableY = target.scrollHeight > target.clientHeight
  const onScrollbarY = isScrollableY && event.clientX > target.clientWidth

  const isScrollableX = target.scrollWidth > target.clientWidth
  const onScrollbarX = isScrollableX && event.clientY > target.clientHeight

  return onScrollbarY || onScrollbarX
}

function trackInteractOutsideImpl(node: MaybeElement, options: InteractOutsideOptions) {
  const { exclude, onFocusOutside, onPointerDownOutside, onInteractOutside, defer } = options

  if (!node) return

  const doc = getDocument(node)
  const win = getWindow(node)
  const frames = getWindowFrames(win)
  const parentWin = getParentWindow(win)

  function isEventOutside(event: Event): boolean {
    const target = getEventTarget(event)
    if (!isHTMLElement(target)) return false
    if (contains(node, target)) return false
    // Ex: password manager selection
    if (isEventPointWithin(node, event)) return false
    // Ex: page content that is scrollable
    if (isEventWithinScrollbar(event, target)) return false
    // Ex: dialog positioner that is scrollable
    const scrollParent = getNearestOverflowAncestor(node!)
    if (isEventWithinScrollbar(event, scrollParent)) return false
    // Custom exclude function
    return !exclude?.(target)
  }

  const pointerdownCleanups: Set<VoidFunction> = new Set()

  function onPointerDown(event: PointerEvent) {
    //
    function handler() {
      const func = defer ? raf : (v: any) => v()
      const composedPath = event.composedPath?.() ?? [event.target]
      func(() => {
        if (!node || !isEventOutside(event)) return

        if (onPointerDownOutside || onInteractOutside) {
          const handler = callAll(onPointerDownOutside, onInteractOutside) as EventListener
          node.addEventListener(POINTER_OUTSIDE_EVENT, handler, { once: true })
        }

        fireCustomEvent(node, POINTER_OUTSIDE_EVENT, {
          bubbles: false,
          cancelable: true,
          detail: {
            originalEvent: event,
            contextmenu: isContextMenuEvent(event),
            focusable: isComposedPathFocusable(composedPath),
          },
        })
      })
    }

    if (event.pointerType === "touch") {
      // flush any pending pointerup events
      pointerdownCleanups.forEach((fn) => fn())
      // add a pointerup event listener to the document and all frame documents
      pointerdownCleanups.add(addDomEvent(doc, "click", handler, { once: true }))
      pointerdownCleanups.add(parentWin.addEventListener("click", handler, { once: true }))
      pointerdownCleanups.add(frames.addEventListener("click", handler, { once: true }))
    } else {
      handler()
    }
  }
  const cleanups = new Set<VoidFunction>()

  const timer = setTimeout(() => {
    cleanups.add(addDomEvent(doc, "pointerdown", onPointerDown, true))
    cleanups.add(parentWin.addEventListener("pointerdown", onPointerDown, true))
    cleanups.add(frames.addEventListener("pointerdown", onPointerDown, true))
  }, 0)

  let hadLastActiveElement = false
  let activeElement: Element | null = doc.activeElement

  function onFocusin(event: FocusEvent) {
    activeElement = doc.activeElement
    //
    const func = defer ? raf : (v: any) => v()
    func(() => {
      if (!node || !isEventOutside(event) || hadLastActiveElement) return

      if (onFocusOutside || onInteractOutside) {
        const handler = callAll(onFocusOutside, onInteractOutside) as EventListener
        node.addEventListener(FOCUS_OUTSIDE_EVENT, handler, { once: true })
      }

      fireCustomEvent(node, FOCUS_OUTSIDE_EVENT, {
        bubbles: false,
        cancelable: true,
        detail: {
          originalEvent: event,
          contextmenu: false,
          focusable: isFocusable(getEventTarget(event)),
        },
      })
    })
  }

  cleanups.add(addDomEvent(doc, "focusin", onFocusin, true))
  cleanups.add(parentWin.addEventListener("focusin", onFocusin, true))
  cleanups.add(frames.addEventListener("focusin", onFocusin, true))

  const obs = new win.MutationObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.removedNodes.length) return
      const removedNodes = Array.from(entry.removedNodes)
      hadLastActiveElement = removedNodes.some((node) => node.contains(activeElement))
    })

    if (hadLastActiveElement && !node.contains(activeElement) && doc.activeElement !== node) {
      node?.focus({ preventScroll: true })
    }
  })

  obs.observe(node, { childList: true, subtree: true })

  return () => {
    clearTimeout(timer)
    pointerdownCleanups.forEach((fn) => fn())
    cleanups.forEach((fn) => fn())
    obs.disconnect()
  }
}

export function trackInteractOutside(nodeOrFn: NodeOrFn, options: InteractOutsideOptions) {
  const { defer } = options
  const func = defer ? raf : (v: any) => v()
  const cleanups: (VoidFunction | undefined)[] = []
  cleanups.push(
    func(() => {
      const node = typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn
      cleanups.push(trackInteractOutsideImpl(node, options))
    }),
  )
  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}
