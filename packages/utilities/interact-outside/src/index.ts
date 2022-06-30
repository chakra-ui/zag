import {
  addDomEvent,
  contains,
  fireCustomEvent,
  getEventTarget,
  getDocument,
  getWindow,
  isFocusable,
} from "@zag-js/dom-utils"
import { isContextMenuEvent } from "@zag-js/utils"

export type InteractOutsideHandlers = {
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void
  onFocusOutside?: (event: FocusOutsideEvent) => void
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
  const { exclude, onFocusOutside, onPointerDownOutside } = options

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

  function onPointerDown(event: PointerEvent) {
    if (!node || !isEventOutside(event)) return
    if (onPointerDownOutside)
      node.addEventListener(POINTER_OUTSIDE_EVENT, onPointerDownOutside as EventListener, { once: true })
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

  const cleanups = new Set<VoidFunction>()

  const timer = setTimeout(() => {
    cleanups.add(addDomEvent(doc, "pointerdown", onPointerDown, true))
  })

  function onFocusin(event: FocusEvent) {
    if (!node || !isEventOutside(event)) return
    if (onFocusOutside) node.addEventListener(FOCUS_OUTSIDE_EVENT, onFocusOutside as EventListener, { once: true })
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
    cleanups.forEach((fn) => fn())
  }
}
