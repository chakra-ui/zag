import { clampValue } from "@zag-js/numeric-range"
import type { Position, Rect, Size } from "../floating-panel.types"

export const addPosition = (a: Position, b: Position) => ({ x: a.x + b.x, y: a.y + b.y })
export const subtractPosition = (a: Position, b: Position) => ({ x: a.x - b.x, y: a.y - b.y })

export const addSize = (a: Size, b: Size) => ({ width: a.width + b.width, height: a.height + b.height })
export const subtractSize = (a: Size, b: Size) => ({ width: a.width - b.width, height: a.height - b.height })

export const clampSize = (size: Size, minSize?: Size, maxSize?: Size) => {
  if (minSize == null && maxSize == null) {
    return size
  }

  if (minSize == null && maxSize != null) {
    return { width: Math.min(size.width, maxSize.width), height: Math.min(size.height, maxSize.height) }
  }

  if (minSize != null && maxSize == null) {
    return { width: Math.max(size.width, minSize.width), height: Math.max(size.height, minSize.height) }
  }

  return {
    width: clampValue(size.width, minSize!.width, maxSize!.width),
    height: clampValue(size.height, minSize!.height, maxSize!.height),
  }
}

export const clampPosition = (position: Position, size: Size, boundaryRect: Rect) => {
  const x = clampValue(position.x, boundaryRect.x, boundaryRect.width - size.width)
  const y = clampValue(position.y, boundaryRect.y, boundaryRect.height - size.height)
  return { x, y }
}
