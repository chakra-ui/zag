import { getNearestOverflowAncestor, isRootElement } from "@zag-js/dom-query"

/**
 * The element that scrolls the headings: `scrollEl` when provided, otherwise the
 * nearest scrollable ancestor of the first heading.
 */
export function getScrollContainer(doc: Document, scrollEl: HTMLElement | null | undefined, headingEl: HTMLElement) {
  if (scrollEl) return scrollEl
  const el = getNearestOverflowAncestor(headingEl)
  return isRootElement(el) ? (doc.scrollingElement as HTMLElement) : el
}

/**
 * The target to listen to for scroll events. The document's scrolling element
 * doesn't receive them, so the window is used instead.
 */
export function getScrollTarget(container: HTMLElement) {
  const doc = container.ownerDocument
  return container === doc.scrollingElement ? doc.defaultView! : container
}

/**
 * The y-position where headings stop counting as visible: the top edge of the
 * observed band (root bounds after `rootMargin`), or the scroll container's edge
 * when it clips headings first.
 */
export function getBandTop(container: HTMLElement, rootBounds: DOMRectReadOnly | null) {
  const viewTop = container === container.ownerDocument.scrollingElement ? 0 : container.getBoundingClientRect().top
  return Math.max(rootBounds?.top ?? viewTop, viewTop)
}
