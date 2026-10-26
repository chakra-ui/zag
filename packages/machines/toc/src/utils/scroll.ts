import { getScrollParent } from "@zag-js/dom-query"

/**
 * The element that scrolls the headings: `scrollEl` when provided, otherwise the
 * nearest ancestor of the heading that actually scrolls, or the page.
 */
export function getScrollContainer(scrollEl: HTMLElement | null | undefined, headingEl: HTMLElement) {
  if (scrollEl) return scrollEl
  return getScrollParent(headingEl, { axis: "y" }) ?? (headingEl.ownerDocument.scrollingElement as HTMLElement)
}

export const hasOverflow = (el: HTMLElement) => el.scrollHeight > el.clientHeight

/**
 * The y-position where headings stop counting as visible: the top edge of the
 * observed band (root bounds after `rootMargin`), or the scroll container's edge
 * when it clips headings first.
 */
export function getBandTop(container: HTMLElement, rootBounds: DOMRectReadOnly | null) {
  const viewTop = container === container.ownerDocument.scrollingElement ? 0 : container.getBoundingClientRect().top
  return Math.max(rootBounds?.top ?? viewTop, viewTop)
}
