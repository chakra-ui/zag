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

/** Like `scrollIntoView({ block: "nearest" })`, but only scrolls `rootEl` */
export function scrollToNearest(el: HTMLElement | null | undefined, options?: ScrollToElementOptions): boolean {
  const { rootEl, behavior } = options || {}
  if (!el || !rootEl) return false
  if (!rootEl.contains(el)) return false

  const win = getWindow(rootEl)
  const rootRect = rootEl.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const rootStyle = win.getComputedStyle(rootEl)
  const elStyle = win.getComputedStyle(el)

  const viewHeight = rootEl.clientHeight
  const viewTop =
    rootRect.top +
    rootEl.clientTop +
    getLength(rootStyle.scrollPaddingBlockStart || rootStyle.scrollPaddingTop, viewHeight)
  const viewBottom =
    rootRect.top +
    rootEl.clientTop +
    viewHeight -
    getLength(rootStyle.scrollPaddingBlockEnd || rootStyle.scrollPaddingBottom, viewHeight)

  const top = elRect.top - getNumericStyle(elStyle.scrollMarginBlockStart || elStyle.scrollMarginTop)
  const bottom = elRect.bottom + getNumericStyle(elStyle.scrollMarginBlockEnd || elStyle.scrollMarginBottom)

  const isLarger = bottom - top > viewBottom - viewTop
  const alignTop = top - viewTop
  const alignBottom = bottom - viewBottom

  let delta = 0
  if (top < viewTop && bottom > viewBottom) {
    return false
  } else if (top < viewTop) {
    delta = isLarger ? alignBottom : alignTop
  } else if (bottom > viewBottom) {
    delta = isLarger ? alignTop : alignBottom
  }

  if (delta === 0) return false
  rootEl.scrollTo({ top: rootEl.scrollTop + delta, ...(behavior && { behavior }) })
  return true
}

const getNumericStyle = (value: string) => {
  const numericValue = Number.parseFloat(value)
  return Number.isNaN(numericValue) ? 0 : numericValue
}

const getLength = (value: string, basis: number) => {
  const numericValue = getNumericStyle(value)
  return value.trim().endsWith("%") ? (numericValue * basis) / 100 : numericValue
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
