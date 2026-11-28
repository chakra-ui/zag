import { createRect, type Rect } from "@zag-js/utils/geometry"
import { getComputedStyle } from "./computed-style"

export function getElementRect(el: HTMLElement, opts: ElementRectOptions = {}): Rect {
  return createRect(getClientRect(el, opts))
}

export type ElementRectOptions = {
  /**
   * Leaves the element's scrollbars out of its size
   */
  excludeScrollbar?: boolean | undefined
  /**
   * Leaves the element's borders out of its size and position
   */
  excludeBorders?: boolean | undefined
}

function getClientRect(el: HTMLElement, opts: ElementRectOptions = {}) {
  const { excludeScrollbar = false, excludeBorders = false } = opts

  const { x, y, width, height } = el.getBoundingClientRect()
  const r = { x, y, width, height }

  const style = getComputedStyle(el)

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
