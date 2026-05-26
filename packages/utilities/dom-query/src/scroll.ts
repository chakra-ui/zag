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
