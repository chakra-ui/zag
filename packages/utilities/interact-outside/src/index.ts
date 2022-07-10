import {
  addDomEvent,
  contains,
  fireCustomEvent,
  getDocument,
  getEventTarget,
  getWindow,
  isContextMenuEvent,
  isFocusable,
} from "@zag-js/dom-utils"
import { callAll } from "@zag-js/utils"

export type InteractOutsideHandlers = {
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void
  onFocusOutside?: (event: FocusOutsideEvent) => void
  onInteractOutside?: (event: InteractOutsideEvent) => void
}

export type InteractOutsideOptions = InteractOutsideHandlers & {
  exclude?: (target: HTMLElement) => boolean
}

type EventDetails<T> = {
  originalEvent: T
  contextmenu: boolean
  focusable: boolean
}

const POINTER_OUTSIDE_EVENT = "pointerdown.outside"
const FOCUS_OUTSIDE_EVENT = "focus.outside"

export type PointerDownOutsideEvent = CustomEvent<EventDetails<PointerEvent>>
export type FocusOutsideEvent = CustomEvent<EventDetails<FocusEvent>>
export type InteractOutsideEvent = PointerDownOutsideEvent | FocusOutsideEvent

export function trackInteractOutside(node: HTMLElement | null, options: InteractOutsideOptions) {
  const { exclude, onFocusOutside, onPointerDownOutside, onInteractOutside } = options

  if (!node) return

  const doc = getDocument(node)
  const win = getWindow(node)

  function isEventOutside(event: Event): boolean {
    const target = getEventTarget(event)

    if (!(target instanceof win.HTMLElement)) {
      return false
    }

    if (!contains(doc.documentElement, target)) {
      return false
    }

    if (contains(node, target)) {
      return false
    }

    return !exclude?.(target)
  }

  let clickHandler: VoidFunction

  function onPointerDown(event: PointerEvent) {
    //
    function handler() {
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
          focusable: isFocusable(getEventTarget(event)),
        },
      })
    }

    if (event.pointerType === "touch") {
      doc.removeEventListener("click", handler)
      clickHandler = handler
      doc.addEventListener("click", handler, { once: true })
    } else {
      handler()
    }
  }
  const cleanups = new Set<VoidFunction>()

  const timer = setTimeout(() => {
    cleanups.add(addDomEvent(doc, "pointerdown", onPointerDown, true))
  }, 0)

  function onFocusin(event: FocusEvent) {
    //
    if (!node || !isEventOutside(event)) return

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
  }

  cleanups.add(addDomEvent(doc, "focusin", onFocusin, true))

  return () => {
    clearTimeout(timer)
    if (clickHandler) doc.removeEventListener("click", clickHandler)
    cleanups.forEach((fn) => fn())
  }
}
