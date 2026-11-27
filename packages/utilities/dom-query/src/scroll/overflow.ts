import { getDocument, getParentNode, getWindow, isHTMLElement, isRootElement } from "../node"

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

const USER_SCROLL_RE = /auto|scroll|overlay/

/** Whether the user can scroll `el` along `axis`: its overflow scrolls, whether or not its content overflows yet */
export function canScrollAxis(el: HTMLElement, axis: "x" | "y"): boolean {
  const style = getWindow(el).getComputedStyle(el)
  return USER_SCROLL_RE.test(axis === "x" ? style.overflowX : style.overflowY)
}

/** The nearest ancestor the user can scroll and whose content overflows it */
export function getNearestScrollableAncestor(el: Node): HTMLElement | null {
  const parent = getParentNode(el)
  if (isRootElement(parent)) return null
  if (isHTMLElement(parent)) {
    const overflowsX = canScrollAxis(parent, "x") && parent.scrollWidth > parent.clientWidth
    const overflowsY = canScrollAxis(parent, "y") && parent.scrollHeight > parent.clientHeight
    if (overflowsX || overflowsY) return parent
  }
  return getNearestScrollableAncestor(parent)
}
