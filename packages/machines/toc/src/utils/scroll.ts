import { getNearestOverflowAncestor, isRootElement } from "@zag-js/dom-query"

export function getScrollContainer(
  doc: Document,
  scrollEl: HTMLElement | null | undefined,
  headingEl: HTMLElement | null,
) {
  if (scrollEl) return scrollEl
  const el = headingEl ? getNearestOverflowAncestor(headingEl) : null
  if (!el || isRootElement(el)) return doc.scrollingElement as HTMLElement
  return el
}

export function getViewBounds(el: HTMLElement) {
  if (el === el.ownerDocument.scrollingElement) {
    return { top: 0, bottom: el.ownerDocument.defaultView!.innerHeight }
  }
  const { top, bottom } = el.getBoundingClientRect()
  return { top, bottom }
}
