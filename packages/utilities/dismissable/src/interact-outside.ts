import { addDomEvent, contains, getEventTarget } from "@zag-js/dom-utils"

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
    const target = getEventTarget(event)
    if (!(target instanceof win.HTMLElement)) return false
    const doc = target.ownerDocument
    if (!contains(doc.documentElement, target)) return false
    if (contains(el, target)) return false
    return !exclude?.(target)
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
