import type { Point, RectInit, Size } from "./types"

export const isSizeEqual = (a: Size, b: Size | undefined) => {
  return a.width === b?.width && a.height === b?.height
}

export const isPointEqual = (a: Point, b: Point | undefined) => {
  return a.x === b?.x && a.y === b?.y
}

export const isRectEqual = (a: RectInit, b: RectInit | undefined) => {
  return isPointEqual(a, b) && isSizeEqual(a, b)
}
