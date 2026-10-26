import { getComputedStyle, getScrollParent } from "@zag-js/dom-query"

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

// Percentages resolve against `basis`
const getPx = (value: string, basis = 0) => {
  const px = Number.parseFloat(value) || 0
  return value.trim().endsWith("%") ? (px * basis) / 100 : px
}

/** Whether the container stopped where navigating to the heading aims, or as close as its scroll range allows */
export function isScrolledToHeading(headingEl: HTMLElement, container: HTMLElement) {
  const viewTop = container === container.ownerDocument.scrollingElement ? 0 : container.getBoundingClientRect().top
  const offset =
    headingEl.getBoundingClientRect().top -
    viewTop -
    getPx(getComputedStyle(container).scrollPaddingTop, container.clientHeight) -
    getPx(getComputedStyle(headingEl).scrollMarginTop)
  const maxScroll = container.scrollHeight - container.clientHeight
  const target = Math.min(Math.max(container.scrollTop + offset, 0), maxScroll)
  return Math.abs(target - container.scrollTop) <= 2
}
