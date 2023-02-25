import type { RectEdge, RectValue } from "./types"

const point = (x: number, y: number) => ({ x, y })

export function createRect(r: RectValue) {
  const { x, y, width, height } = r
  const midX = x + width / 2
  const midY = y + height / 2
  return {
    x,
    y,
    width,
    height,
    minX: x,
    minY: y,
    maxX: x + width,
    maxY: y + height,
    midX,
    midY,
    center: point(midX, midY),
  }
}

export type Rect = ReturnType<typeof createRect>

const hasProp = <T extends string>(obj: any, prop: T): obj is Record<T, any> =>
  Object.prototype.hasOwnProperty.call(obj, prop)

export function isRect(v: any): v is Rect {
  return hasProp(v, "x") && hasProp(v, "y") && hasProp(v, "width") && hasProp(v, "height")
}

export function getRectCenters(v: Rect) {
  const top = point(v.midX, v.minY)
  const right = point(v.maxX, v.midY)
  const bottom = point(v.midX, v.maxY)
  const left = point(v.minX, v.midY)
  return { top, right, bottom, left }
}

export function getRectCorners(v: Rect) {
  const top = point(v.minX, v.minY)
  const right = point(v.maxX, v.minY)
  const bottom = point(v.maxX, v.maxY)
  const left = point(v.minX, v.maxY)
  return { top, right, bottom, left }
}

export function getRectEdges(v: Rect) {
  const c = getRectCorners(v)
  const top: RectEdge = [c.top, c.right]
  const right: RectEdge = [c.right, c.bottom]
  const bottom: RectEdge = [c.left, c.bottom]
  const left: RectEdge = [c.top, c.left]
  return { top, right, bottom, left }
}
