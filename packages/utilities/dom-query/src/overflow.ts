import { getDocument, getParentNode, getWindow, isHTMLElement, isRootElement, isVisualViewport } from "./node"

export type OverflowAncestor = Array<VisualViewport | Window | HTMLElement | null>

/** The nearest ancestor that clips `el` (any non-visible overflow), falling back to `body`. Use for positioning */
export function getNearestOverflowAncestor(el: Node): HTMLElement {
  const parentNode = getParentNode(el)
  if (isRootElement(parentNode)) return getDocument(parentNode).body
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) return parentNode
  return getNearestOverflowAncestor(parentNode)
}

/** Every ancestor that clips `el`, ending with the window and visual viewport. Use for positioning */
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

const nonOverflowValues = new Set<string>(["inline", "contents"])

/** Whether `el` clips its content, even if it can't scroll */
export function isOverflowElement(el: HTMLElement): boolean {
  const win = getWindow(el)
  const { overflow, overflowX, overflowY, display } = win.getComputedStyle(el)
  return OVERFLOW_RE.test(overflow + overflowY + overflowX) && !nonOverflowValues.has(display)
}

export interface ScrollableOptions {
  /** Only consider this axis. Defaults to either axis */
  axis?: "x" | "y" | undefined
}

const SCROLL_RE = /auto|scroll|overlay|hidden/

/** Whether `el` is a scroll container whose content overflows it */
export function isScrollable(el: HTMLElement, options: ScrollableOptions = {}): boolean {
  const { axis } = options
  const { overflowX, overflowY } = getWindow(el).getComputedStyle(el)
  const x = axis !== "y" && SCROLL_RE.test(overflowX) && el.scrollWidth > el.clientWidth
  const y = axis !== "x" && SCROLL_RE.test(overflowY) && el.scrollHeight > el.clientHeight
  return x || y
}

export interface ScrollParentOptions extends ScrollableOptions {
  /** Stops the search, returning `null`, at the first ancestor that matches */
  stop?: ((el: HTMLElement) => boolean) | undefined
}

/** The nearest scrollable ancestor of `el`, excluding the page scroller. Use for scrolling */
export function getScrollParent(el: Node, options: ScrollParentOptions = {}): HTMLElement | null {
  const { stop } = options
  let node = getParentNode(el)
  while (isHTMLElement(node) && !isRootElement(node)) {
    if (stop?.(node)) return null
    if (isScrollable(node, options)) return node
    node = getParentNode(node)
  }
  return null
}

const SCROLLABLE_RE = /auto|scroll/

/** The nearest ancestor with `auto` or `scroll` overflow whose content overflows it */
export function getNearestScrollableAncestor(el: Node): HTMLElement | null {
  const parent = getParentNode(el)
  if (isRootElement(parent)) return null
  if (isHTMLElement(parent)) {
    const { overflow, overflowX, overflowY } = getWindow(parent).getComputedStyle(parent)
    if (SCROLLABLE_RE.test(overflow + overflowX + overflowY) && isScrollable(parent)) return parent
  }
  return getNearestScrollableAncestor(parent)
}
