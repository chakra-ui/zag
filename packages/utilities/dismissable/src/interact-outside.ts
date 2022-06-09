import { addDomEvent, contains } from "@zag-js/dom-utils"

export type InteractOutsideOptions = {
  exclude?: (target: HTMLElement) => boolean
  onPointerDownOutside?: (event: Event) => void
  onFocusOutside?: (event: Event) => void
}

export function trackInteractOutside(el: HTMLElement | null, options: InteractOutsideOptions) {
  const { exclude, onPointerDownOutside, onFocusOutside } = options

  if (!el) return

  const doc = el.ownerDocument
  const win = doc.defaultView || window

  function isEventOutside(event: Event): boolean {
    if (!(event.target instanceof win.HTMLElement)) return false

    const doc = event.target.ownerDocument
    if (!contains(doc.documentElement, event.target)) return false

    if (contains(el, event.target)) return false

    return !exclude?.(event.target)
  }

  function onPointerDown(event: PointerEvent) {
    if (isEventOutside(event)) {
      onPointerDownOutside?.(event)
    }
  }

  const cleanups = new Set<VoidFunction>()

  const timer = setTimeout(() => {
    cleanups.add(addDomEvent(doc, "pointerdown", onPointerDown, true))
  })

  function onFocusin(event: FocusEvent) {
    if (isEventOutside(event)) {
      onFocusOutside?.(event)
    }
  }

  cleanups.add(addDomEvent(doc, "focusin", onFocusin, true))

  return () => {
    clearTimeout(timer)
    cleanups.forEach((fn) => fn())
  }
}
