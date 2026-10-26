import { getScrollParent } from "@zag-js/dom-query"

/** `scrollEl`, or the nearest ancestor of the heading that scrolls, or the page */
export function getScrollContainer(scrollEl: HTMLElement | null | undefined, headingEl: HTMLElement) {
  if (scrollEl) return scrollEl
  return getScrollParent(headingEl, { axis: "y" }) ?? (headingEl.ownerDocument.scrollingElement as HTMLElement)
}

export const hasOverflow = (el: HTMLElement) => el.scrollHeight > el.clientHeight

/** The top of the observed band, or of the container when it clips first */
export function getBandTop(container: HTMLElement, rootBounds: DOMRectReadOnly | null) {
  const viewTop = container === container.ownerDocument.scrollingElement ? 0 : container.getBoundingClientRect().top
  return Math.max(rootBounds?.top ?? viewTop, viewTop)
}

/** The page scroller's view is the window */
export const getViewport = (container: HTMLElement) =>
  container === container.ownerDocument.scrollingElement ? container.ownerDocument.defaultView! : container
