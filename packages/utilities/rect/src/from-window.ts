import { createRect } from "./rect"
import type { Rect } from "./types"

export type WindowRectOptions = {
  /**
   * Whether to exclude the element's scrollbar size from the calculation.
   */
  excludeScrollbar?: boolean
}

/**
 * Creates a rectange from window object
 */
export function getWindowRect(win: Window, opts: WindowRectOptions = {}): Rect {
  return createRect(getViewportRect(win, opts))
}

/**
 * Get the rect of the window with the option to exclude the scrollbar
 */
export function getViewportRect(win: Window, opts: WindowRectOptions) {
  const { excludeScrollbar = false } = opts
  const { innerWidth, innerHeight, document: doc, visualViewport } = win
  const width = visualViewport?.width || innerWidth
  const height = visualViewport?.height || innerHeight
  const rect = { x: 0, y: 0, width, height }
  if (excludeScrollbar) {
    const scrollbarWidth = innerWidth - doc.documentElement.clientWidth
    const scrollbarHeight = innerHeight - doc.documentElement.clientHeight
    rect.width -= scrollbarWidth
    rect.height -= scrollbarHeight
  }
  return rect
}
