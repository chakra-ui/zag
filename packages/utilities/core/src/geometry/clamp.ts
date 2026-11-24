import type { Point, RectInit, Size } from "./types"

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export const clampPoint = (position: Point, size: Size, boundaryRect: RectInit) => {
  const x = clamp(position.x, boundaryRect.x, boundaryRect.x + boundaryRect.width - size.width)
  const y = clamp(position.y, boundaryRect.y, boundaryRect.y + boundaryRect.height - size.height)
  return { x, y }
}

const defaultMinSize: Size = {
  width: 0,
  height: 0,
}

const defaultMaxSize: Size = {
  width: Infinity,
  height: Infinity,
}

export const clampSize = (size: Size, minSize = defaultMinSize, maxSize = defaultMaxSize) => {
  return {
    width: Math.min(Math.max(size.width, minSize!.width), maxSize!.width),
    height: Math.min(Math.max(size.height, minSize!.height), maxSize!.height),
  }
}
