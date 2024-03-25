import { createRect } from "./rect"
import { getElementRect } from "./from-element"
import { union } from "./union"
import type { Rect } from "./types"

export function fromRange(range: Range): Rect {
  let rs: Rect[] = []
  const rects = Array.from(range.getClientRects())

  if (rects.length) {
    rs = rs.concat(rects.map(createRect))
    return union.apply(undefined, rs)
  }

  let start: Node | ParentNode | null = range.startContainer

  if (start.nodeType === Node.TEXT_NODE) {
    start = start.parentNode
  }

  if (start instanceof HTMLElement) {
    const r = getElementRect(start)
    rs.push({ ...r, x: r.maxX, width: 0 })
  }

  return union.apply(undefined, rs)
}
