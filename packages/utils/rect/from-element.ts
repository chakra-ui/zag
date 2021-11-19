import { rect } from "."
import type { Rect } from "./types"
import { getStyle } from "./get-style"

/**
 * Creates a rectangle from an HTML element
 */
export function fromElement(el: HTMLElement, opts: ElementRectOptions = {}): Rect {
  return rect(getElementRect(el, opts))
}

export type ElementRectOptions = {
  /**
   * Whether to exclude the element's scrollbar size from the calculation.
   */
  excludeScrollbar?: boolean
  /**
   * Whether to exclude the element's borders from the calculation.
   */
  excludeBorders?: boolean
}

/**
 * Get the rect of an element with the option to exclude the scrollbar or borders
 */
export function getElementRect(el: HTMLElement, opts: ElementRectOptions = {}) {
  const { excludeScrollbar = false, excludeBorders = false } = opts

  const { x, y, width, height } = el.getBoundingClientRect()
  const r = { x, y, width, height }

  const style = getStyle(el)

  const { borderLeftWidth, borderTopWidth, borderRightWidth, borderBottomWidth } = style

  const borderXWidth = sum(borderLeftWidth, borderRightWidth)
  const borderYWidth = sum(borderTopWidth, borderBottomWidth)

  if (excludeBorders) {
    r.width -= borderXWidth
    r.height -= borderYWidth
    r.x += px(borderLeftWidth)
    r.y += px(borderTopWidth)
  }

  if (excludeScrollbar) {
    const scrollbarWidth = el.offsetWidth - el.clientWidth - borderXWidth
    const scrollbarHeight = el.offsetHeight - el.clientHeight - borderYWidth
    r.width -= scrollbarWidth
    r.height -= scrollbarHeight
  }

  return r
}

const px = (v: string) => parseFloat(v.replace("px", ""))

const sum = (...vals: string[]) => vals.reduce((sum, v) => sum + (v ? px(v) : 0), 0)
