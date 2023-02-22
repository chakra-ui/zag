import { addDomEvent, fireCustomEvent, isContextMenuEvent } from "@zag-js/dom-event"
import { contains, getDocument, getEventTarget, getWindow, isHTMLElement } from "@zag-js/dom-query"
import { isFocusable } from "@zag-js/tabbable"
import { callAll } from "@zag-js/utils"
import { getWindowFrames } from "./get-window-frames"

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
  const frames = getWindowFrames(win)

  function isEventOutside(event: Event): boolean {
    const target = getEventTarget(event)

    if (!isHTMLElement(target)) {
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
      frames.removeEventListener("click", handler)
      doc.removeEventListener("click", handler)

      clickHandler = handler

      doc.addEventListener("click", handler, { once: true })
      frames.addEventListener("click", handler, { once: true })
    } else {
      handler()
    }
  }
  const cleanups = new Set<VoidFunction>()

  const timer = setTimeout(() => {
    cleanups.add(frames.addEventListener("pointerdown", onPointerDown, true))
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
  cleanups.add(frames.addEventListener("focusin", onFocusin, true))

  return () => {
    clearTimeout(timer)
    if (clickHandler) {
      frames.removeEventListener("click", clickHandler)
      doc.removeEventListener("click", clickHandler)
    }
    cleanups.forEach((fn) => fn())
  }
}
