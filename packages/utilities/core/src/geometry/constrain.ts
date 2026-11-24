import type { RectInit } from "./types"

// given a rect and a boundary, return a new rect that is constrained within the boundary
// resize or reposition the rect so that it fits within the boundary
export const constrainRect = (rect: RectInit, boundary: RectInit): RectInit => {
  const left = Math.max(boundary.x, Math.min(rect.x, boundary.x + boundary.width - rect.width))
  const top = Math.max(boundary.y, Math.min(rect.y, boundary.y + boundary.height - rect.height))

  return {
    x: left,
    y: top,
    width: Math.min(rect.width, boundary.width),
    height: Math.min(rect.height, boundary.height),
  }
}
