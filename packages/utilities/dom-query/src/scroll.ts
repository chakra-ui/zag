import { getWindow, isHTMLElement } from "./node"
import { isScrollable } from "./overflow"

export interface ScrollOptions extends ScrollIntoViewOptions {
  rootEl: HTMLElement | null
}

export interface ScrollToElementOptions {
  rootEl: HTMLElement | null
  behavior?: ScrollBehavior | undefined
}

export function scrollIntoView(el: HTMLElement | null | undefined, options?: ScrollOptions): void {
  const { rootEl, ...scrollOptions } = options || {}
  if (!el || !rootEl) return
  if (!isScrollable(rootEl)) return
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

export interface ScrollOffset {
  top: number
  left: number
}

export interface NearestScrollOffsetOptions {
  rootEl: HTMLElement | null | undefined
}

/** The scroll position of `rootEl` that shows `el` with `nearest` alignment, or `null` if it's already visible */
export function getNearestScrollOffset(
  el: HTMLElement | null | undefined,
  options?: NearestScrollOffsetOptions,
): ScrollOffset | null {
  const { rootEl } = options || {}
  if (!el || !rootEl || !rootEl.contains(el)) return null

  const win = getWindow(rootEl)
  const rootRect = rootEl.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const rootStyle = win.getComputedStyle(rootEl)
  const elStyle = win.getComputedStyle(el)

  // work in rootEl's layout pixels, since rects include transforms but scroll offsets don't
  const scaleX = rootEl.offsetWidth ? rootRect.width / rootEl.offsetWidth : 1
  const scaleY = rootEl.offsetHeight ? rootRect.height / rootEl.offsetHeight : 1
  const { clientTop, clientLeft, clientWidth, clientHeight } = rootEl

  const deltaY = alignNearest(
    clientTop + getLength(rootStyle.scrollPaddingTop, clientHeight),
    clientTop + clientHeight - getLength(rootStyle.scrollPaddingBottom, clientHeight),
    (elRect.top - rootRect.top) / scaleY - getNumericStyle(elStyle.scrollMarginTop),
    (elRect.bottom - rootRect.top) / scaleY + getNumericStyle(elStyle.scrollMarginBottom),
  )
  const deltaX = alignNearest(
    clientLeft + getLength(rootStyle.scrollPaddingLeft, clientWidth),
    clientLeft + clientWidth - getLength(rootStyle.scrollPaddingRight, clientWidth),
    (elRect.left - rootRect.left) / scaleX - getNumericStyle(elStyle.scrollMarginLeft),
    (elRect.right - rootRect.left) / scaleX + getNumericStyle(elStyle.scrollMarginRight),
  )

  if (deltaX === 0 && deltaY === 0) return null
  return { top: rootEl.scrollTop + deltaY, left: rootEl.scrollLeft + deltaX }
}

/** Like `scrollIntoView({ block: "nearest", inline: "nearest" })`, but only scrolls `rootEl` */
export function scrollToNearest(el: HTMLElement | null | undefined, options?: ScrollToElementOptions): boolean {
  const { rootEl } = options || {}
  const offset = getNearestScrollOffset(el, { rootEl })
  if (!rootEl || !offset) return false

  let behavior = options?.behavior
  if (behavior === "smooth" && prefersReducedMotion(rootEl)) behavior = "instant"

  rootEl.scrollTo({ ...offset, ...(behavior && { behavior }) })
  return true
}

function alignNearest(viewStart: number, viewEnd: number, start: number, end: number): number {
  if (start < viewStart && end > viewEnd) return 0
  const isLarger = end - start > viewEnd - viewStart
  if (start < viewStart) return isLarger ? end - viewEnd : start - viewStart
  if (end > viewEnd) return isLarger ? start - viewStart : end - viewEnd
  return 0
}

const prefersReducedMotion = (el: HTMLElement) =>
  !!getWindow(el).matchMedia?.("(prefers-reduced-motion: reduce)").matches

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
