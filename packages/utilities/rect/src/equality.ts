import type { Point, RectInit, Size } from "./types"

export const isSizeEqual = (a: Size, b: Size) => {
  return a.width === b.width && a.height === b.height
}

export const isPointEqual = (a: Point, b: Point) => {
  return a.x === b.x && a.y === b.y
}

export const isRectEqual = (a: RectInit, b: RectInit) => {
  return isPointEqual(a, b) && isSizeEqual(a, b)
}
