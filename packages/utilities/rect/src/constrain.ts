import type { RectInit } from "./types"

// given a rect and a boundary, return a new rect that is constrained within the boundary
// resize or reposition the rect so that it fits within the boundary
export const constrainRect = (rect: RectInit, boundary: RectInit): RectInit => {
  const { x, y, width, height } = rect
  const { x: bx, y: by, width: bw, height: bh } = boundary

  const left = Math.max(bx, Math.min(x, bx + bw - width))
  const top = Math.max(by, Math.min(y, by + bh - height))

  return {
    x: left,
    y: top,
    width: Math.min(width, bw),
    height: Math.min(height, bh),
  }
}
