import { getComputedStyle, getParentNode, isHTMLElement, isRootElement } from "@zag-js/dom-query"
import { warn } from "@zag-js/utils"
import type { Edge, Orientation } from "./infinite-scroll.types"

const SCROLLABLE_OVERFLOW_RE = /auto|scroll|overlay/

export interface RootMarginOptions {
  offset: number | string
  orientation: Orientation
  edge: Edge
  dir: "ltr" | "rtl"
}

export function toMarginValue(offset: number | string): string {
  if (typeof offset !== "number") return offset
  warn(
    offset > 10,
    `[zag-js/infinite-scroll] \`offset={${offset}}\` means ${offset} viewports, not pixels. Did you mean \`offset="${offset}px"\`?`,
  )
  return `${offset * 100}%`
}

/**
 * Expands only the leading edge of the observer root. Expanding all four sides
 * causes cross-axis false positives on horizontal scrollers.
 */
export function getRootMargin(options: RootMarginOptions): string {
  const { orientation, edge, dir } = options
  const margin = toMarginValue(options.offset)

  if (orientation === "vertical") {
    return edge === "end" ? `0px 0px ${margin} 0px` : `${margin} 0px 0px 0px`
  }

  const atRightEdge = dir === "rtl" ? edge === "start" : edge === "end"
  return atRightEdge ? `0px ${margin} 0px 0px` : `0px 0px 0px ${margin}`
}

export function isScrollableElement(el: HTMLElement): boolean {
  const { overflow, overflowX, overflowY, display } = getComputedStyle(el)
  if (display === "inline" || display === "contents") return false
  // Style alone, not current overflow: the root is captured at mount, before the list can scroll.
  return SCROLLABLE_OVERFLOW_RE.test(overflow + overflowY + overflowX)
}

/**
 * Nearest scrolling ancestor, or `null` when the page is the scroller. Walks via `getParentNode`
 * to cross shadow boundaries. The dom-query helpers don't fit: one matches `hidden`/`clip`, the
 * other requires the ancestor to be overflowing already.
 */
export function resolveScroller(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null

  let node = getParentNode(el)
  while (!isRootElement(node)) {
    if (isHTMLElement(node) && isScrollableElement(node)) return node
    node = getParentNode(node)
  }

  return null
}

/**
 * The element to measure, and to correct the scroll position on. Falls back to the document's
 * scrolling element when the page itself is the scroller.
 */
export function getScrollingElement(el: HTMLElement | null, doc: Document): HTMLElement | null {
  if (el) return el
  return (doc.scrollingElement as HTMLElement | null) ?? doc.documentElement
}
