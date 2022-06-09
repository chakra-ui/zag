import { isHTMLElement, walkTreeOutside } from "@zag-js/dom-utils"

function disableElement(el: Element) {
  if (!isHTMLElement(el)) return
  const previousPointerEvents = el.style.pointerEvents
  el.style.pointerEvents = "none"
  return () => {
    el.style.pointerEvents = previousPointerEvents ?? ""
  }
}

export function disablePointerEventsOutside(els: Array<Element | null>, exclude?: (target: Element) => boolean) {
  const cleanups: Array<() => void> = []

  walkTreeOutside(els, (el) => {
    if (exclude?.(el)) return
    const fn = disableElement(el)
    if (fn) cleanups.unshift(fn)
  })

  return () => {
    cleanups.forEach((fn) => fn())
  }
}
