import { getDocument, getParentNode, getWindow } from "./node"
import { isHTMLElement, isRootElement, isVisualViewport } from "./node"

export type OverflowAncestor = Array<VisualViewport | Window | HTMLElement | null>

export function getNearestOverflowAncestor(el: Node): HTMLElement {
  const parentNode = getParentNode(el)
  if (isRootElement(parentNode)) return getDocument(parentNode).body
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) return parentNode
  return getNearestOverflowAncestor(parentNode)
}

export function getOverflowAncestors(el: HTMLElement, list: OverflowAncestor = []): OverflowAncestor {
  const scrollableAncestor = getNearestOverflowAncestor(el)
  const isBody = scrollableAncestor === el.ownerDocument.body
  const win = getWindow(scrollableAncestor)
  if (isBody) {
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [])
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, []))
}

const getElementRect = (el: HTMLElement | Window | VisualViewport) => {
  if (isHTMLElement(el)) return el.getBoundingClientRect()
  if (isVisualViewport(el)) return { top: 0, left: 0, bottom: el.height, right: el.width }
  return { top: 0, left: 0, bottom: el.innerHeight, right: el.innerWidth }
}

export function isInView(el: HTMLElement | Window | VisualViewport, ancestor: HTMLElement | Window | VisualViewport) {
  if (!isHTMLElement(el)) return true
  const ancestorRect = getElementRect(ancestor)
  const elRect = el.getBoundingClientRect()
  return (
    elRect.top >= ancestorRect.top &&
    elRect.left >= ancestorRect.left &&
    elRect.bottom <= ancestorRect.bottom &&
    elRect.right <= ancestorRect.right
  )
}

const OVERFLOW_RE = /auto|scroll|overlay|hidden|clip/

export function isOverflowElement(el: HTMLElement): boolean {
  const win = getWindow(el)
  const { overflow, overflowX, overflowY, display } = win.getComputedStyle(el)
  return OVERFLOW_RE.test(overflow + overflowY + overflowX) && !["inline", "contents"].includes(display)
}

export interface ScrollOptions extends ScrollIntoViewOptions {
  rootEl: HTMLElement | null
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
