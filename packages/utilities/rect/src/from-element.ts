import { createRect } from "./rect"
import type { Rect } from "./types"

const styleCache = new WeakMap<HTMLElement, any>()

function getCacheComputedStyle(el: HTMLElement) {
  if (!styleCache.has(el)) {
    const win = el.ownerDocument.defaultView || window
    styleCache.set(el, win.getComputedStyle(el))
  }
  return styleCache.get(el)
}

export function getElementRect(el: HTMLElement, opts: ElementRectOptions = {}): Rect {
  return createRect(getClientRect(el, opts))
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

function getClientRect(el: HTMLElement, opts: ElementRectOptions = {}) {
  const { excludeScrollbar = false, excludeBorders = false } = opts

  const { x, y, width, height } = el.getBoundingClientRect()
  const r = { x, y, width, height }

  const style = getCacheComputedStyle(el)

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
