import { createRect, type Rect } from "@zag-js/utils/geometry"

export type WindowRectOptions = {
  /**
   * Leaves the page's scrollbars out of the size
   */
  excludeScrollbar?: boolean | undefined
}

/**
 * The window's visible area as a rect
 */
export function getWindowRect(win: Window, opts: WindowRectOptions = {}): Rect {
  return createRect(getViewportRect(win, opts))
}

/**
 * The window's visible area, using the visual viewport where there is one
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
