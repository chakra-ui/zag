import { getScrollParent, getScrollTopToElement } from "@zag-js/dom-query"

/** `scrollEl`, or the nearest ancestor of the heading that scrolls, or the page */
export function getScrollContainer(scrollEl: HTMLElement | null | undefined, headingEl: HTMLElement) {
  if (scrollEl) return scrollEl
  return getScrollParent(headingEl, { axis: "y" }) ?? (headingEl.ownerDocument.scrollingElement as HTMLElement)
}

/** Looks the container up again while it doesn't scroll, since content can grow after mount */
export function resolveScrollContainer(
  cached: HTMLElement | null,
  scrollEl: HTMLElement | null | undefined,
  headingEl: HTMLElement,
) {
  if (cached && cached.scrollHeight > cached.clientHeight) return cached
  return getScrollContainer(scrollEl, headingEl)
}

/** The top of the observed band, or of the container when it clips first */
export function getBandTop(container: HTMLElement, rootBounds: DOMRectReadOnly | null) {
  const viewTop = container === container.ownerDocument.scrollingElement ? 0 : container.getBoundingClientRect().top
  return Math.max(rootBounds?.top ?? viewTop, viewTop)
}

/** Whether the container stopped where navigating to the heading aims */
export const isScrolledToHeading = (headingEl: HTMLElement, container: HTMLElement) =>
  Math.abs(getScrollTopToElement(headingEl, container) - container.scrollTop) <= 2
