import { getComputedStyle } from "./computed-style"
import { addDomEvent } from "./event"
import { getWindow, isHTMLElement } from "./node"
import { getScrollParent, isScrollable } from "./overflow"
import { Timeout } from "./timeout"

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

/** The `scrollTop` of `rootEl` that aligns the top of `el` with it, like `scrollIntoView({ block: "start" })` */
export function getScrollTopToElement(el: HTMLElement, rootEl: HTMLElement): number {
  const elTop = el.getBoundingClientRect().top
  let distance = elTop

  if (rootEl !== rootEl.ownerDocument.scrollingElement) {
    const rootRect = rootEl.getBoundingClientRect()
    // Rects include transforms, scroll offsets don't
    const scale = rootEl.offsetHeight ? rootRect.height / rootEl.offsetHeight : 1
    distance = (elTop - rootRect.top) / scale - rootEl.clientTop
  }

  const padding = getLength(getComputedStyle(rootEl).scrollPaddingTop, rootEl.clientHeight)
  const margin = getNumericStyle(getComputedStyle(el).scrollMarginTop)
  const maxScroll = rootEl.scrollHeight - rootEl.clientHeight
  return Math.min(Math.max(rootEl.scrollTop + distance - padding - margin, 0), maxScroll)
}

export function scrollToElement(el: HTMLElement | null | undefined, options?: ScrollToElementOptions): boolean {
  const { rootEl, behavior } = options || {}
  if (!el || !rootEl || !rootEl.contains(el)) return false
  rootEl.scrollTo({ top: getScrollTopToElement(el, rootEl), ...(behavior && { behavior }) })
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

/**
 * Like `scrollIntoView({ block: "nearest", inline: "nearest" })`, but only scrolls `rootEl`,
 * or, when `rootEl` doesn't scroll, the nearest scrollable ancestor of `el` inside it
 * (e.g. a scroll area nested in the content)
 */
export function scrollToNearest(el: HTMLElement | null | undefined, options?: ScrollToElementOptions): boolean {
  const scrollEl = getScrollRoot(el, options?.rootEl)
  const offset = getNearestScrollOffset(el, { rootEl: scrollEl })
  if (!scrollEl || !offset) return false

  let behavior = options?.behavior
  if (behavior === "smooth" && prefersReducedMotion(scrollEl)) behavior = "instant"

  scrollEl.scrollTo({ ...offset, ...(behavior && { behavior }) })
  return true
}

function getScrollRoot(el: HTMLElement | null | undefined, rootEl: HTMLElement | null | undefined) {
  if (!el || !rootEl || isScrollable(rootEl)) return rootEl
  return getScrollParent(el, { stop: (node) => !rootEl.contains(node) }) ?? rootEl
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

export interface ScrollEndOptions {
  /** How long scrolling must pause, in ms. Defaults to `150` */
  delay?: number | undefined
  /** Starts waiting right away, so `fn` also runs when nothing scrolls */
  immediate?: boolean | undefined
  /** Catches scrolling in any descendant, since scroll events don't bubble */
  capture?: boolean | undefined
  /** The timer to use, so a pending call can be cleared elsewhere */
  timeout?: Timeout | undefined
}

/** Calls `fn` once scroll events on `target` pause for `delay` */
export function trackScrollEnd(target: EventTarget, fn: VoidFunction, options: ScrollEndOptions = {}): VoidFunction {
  const { delay = 150, immediate = false, capture = false, timeout = Timeout.create() } = options
  const restart = () => timeout.start(delay, fn)
  if (immediate) restart()
  const cleanup = addDomEvent(target, "scroll", restart, { capture, passive: true })
  return () => {
    cleanup()
    timeout.clear()
  }
}
