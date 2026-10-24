import { getWindow, isHTMLElement } from "./node"
import { isOverflowElement } from "./overflow"

export interface ScrollOptions extends ScrollIntoViewOptions {
  rootEl: HTMLElement | null
}

export interface ScrollToElementOptions {
  rootEl: HTMLElement | null
  behavior?: ScrollBehavior | undefined
}

function isScrollable(el: HTMLElement): boolean {
  return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth
}

export function scrollIntoView(el: HTMLElement | null | undefined, options?: ScrollOptions): void {
  const { rootEl, ...scrollOptions } = options || {}
  if (!el || !rootEl) return
  if (!isOverflowElement(rootEl) || !isScrollable(rootEl)) return
  el.scrollIntoView(scrollOptions)
}

export function scrollToElement(el: HTMLElement | null | undefined, options?: ScrollToElementOptions): boolean {
  const { rootEl, behavior } = options || {}
  if (!el || !rootEl) return false
  if (!rootEl.contains(el)) return false

  const win = getWindow(rootEl)
  const rootRect = rootEl.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const rootStyle = win.getComputedStyle(rootEl)
  const elStyle = win.getComputedStyle(el)

  const scrollPaddingTop = getNumericStyle(rootStyle.scrollPaddingBlockStart || rootStyle.scrollPaddingTop)
  const scrollMarginTop = getNumericStyle(elStyle.scrollMarginBlockStart || elStyle.scrollMarginTop)
  const top = elRect.top - rootRect.top + rootEl.scrollTop - scrollPaddingTop - scrollMarginTop

  rootEl.scrollTo({ top, ...(behavior && { behavior }) })
  return true
}

/**
 * Scrolls `rootEl` (and only `rootEl`, unlike `el.scrollIntoView`) by the least amount needed to
 * show `el` vertically, like `block: "nearest"`. Does nothing when `el` is already visible.
 * Returns whether a scroll was requested.
 */
export function scrollToNearest(el: HTMLElement | null | undefined, options?: ScrollToElementOptions): boolean {
  const { rootEl, behavior } = options || {}
  if (!el || !rootEl) return false
  if (!rootEl.contains(el)) return false

  const win = getWindow(rootEl)
  const rootRect = rootEl.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const rootStyle = win.getComputedStyle(rootEl)
  const elStyle = win.getComputedStyle(el)

  // the visible area of rootEl, excluding borders and scroll padding
  const viewTop =
    rootRect.top + rootEl.clientTop + getNumericStyle(rootStyle.scrollPaddingBlockStart || rootStyle.scrollPaddingTop)
  const viewBottom =
    rootRect.top +
    rootEl.clientTop +
    rootEl.clientHeight -
    getNumericStyle(rootStyle.scrollPaddingBlockEnd || rootStyle.scrollPaddingBottom)

  const top = elRect.top - getNumericStyle(elStyle.scrollMarginBlockStart || elStyle.scrollMarginTop)
  const bottom = elRect.bottom + getNumericStyle(elStyle.scrollMarginBlockEnd || elStyle.scrollMarginBottom)

  let delta = 0
  if (top < viewTop) {
    delta = top - viewTop
  } else if (bottom > viewBottom) {
    // align the bottom edge, unless that would push the top out of view
    delta = Math.min(bottom - viewBottom, top - viewTop)
  }

  if (delta === 0) return false
  rootEl.scrollTo({ top: rootEl.scrollTop + delta, ...(behavior && { behavior }) })
  return true
}

const getNumericStyle = (value: string) => {
  const numericValue = Number.parseFloat(value)
  return Number.isNaN(numericValue) ? 0 : numericValue
}

export interface ScrollPosition {
  scrollLeft: number
  scrollTop: number
}

export function getScrollPosition(element: HTMLElement | Window): ScrollPosition {
  if (isHTMLElement(element)) {
    return { scrollLeft: element.scrollLeft, scrollTop: element.scrollTop }
  }
  return { scrollLeft: element.scrollX, scrollTop: element.scrollY }
}
