import type { Point, Rect, RectEdge, RectInit, Size } from "./types"

/* -----------------------------------------------------------------------------
 * Point
 * -----------------------------------------------------------------------------*/

export const ZERO_POINT: Point = Object.freeze({ x: 0, y: 0 })

export const createPoint = (x: number, y: number) => ({ x, y })

export const subtractPoints = (a: Point, b: Point | null) => {
  if (!b) return a
  return createPoint(a.x - b.x, a.y - b.y)
}

export const addPoints = (a: Point, b: Point) => createPoint(a.x + b.x, a.y + b.y)

export const getMidpoint = (a: Point, b: Point, offset?: Point): Point => ({
  x: (a.x + b.x) / 2 - (offset?.x ?? 0),
  y: (a.y + b.y) / 2 - (offset?.y ?? 0),
})

export function isPoint(v: any): v is Point {
  return Reflect.has(v, "x") && Reflect.has(v, "y")
}

/* -----------------------------------------------------------------------------
 * Rect
 * -----------------------------------------------------------------------------*/

export function createRect(r: RectInit): Rect {
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
    center: createPoint(midX, midY),
  }
}

export function isRect(v: any): v is Rect {
  return Reflect.has(v, "x") && Reflect.has(v, "y") && Reflect.has(v, "width") && Reflect.has(v, "height")
}

export function getRectCenters(v: Rect) {
  const top = createPoint(v.midX, v.minY)
  const right = createPoint(v.maxX, v.midY)
  const bottom = createPoint(v.midX, v.maxY)
  const left = createPoint(v.minX, v.midY)
  return { top, right, bottom, left }
}

export function getRectCorners(v: Rect) {
  const top = createPoint(v.minX, v.minY)
  const right = createPoint(v.maxX, v.minY)
  const bottom = createPoint(v.maxX, v.maxY)
  const left = createPoint(v.minX, v.maxY)
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

export const getCenterPoint = (rect: RectInit): Point => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2,
})

export const isVisibleSize = (size: Size): boolean => size.width > 0 && size.height > 0

export const scaleSize = (size: Size, factor: number): Size => ({
  width: size.width * factor,
  height: size.height * factor,
})

export const scaleRect = (rect: RectInit, scale: Point): RectInit => ({
  x: rect.x * scale.x,
  y: rect.y * scale.y,
  width: rect.width * scale.x,
  height: rect.height * scale.y,
})

export const roundRect = (rect: RectInit): RectInit => ({
  x: Math.round(rect.x),
  y: Math.round(rect.y),
  width: Math.round(rect.width),
  height: Math.round(rect.height),
})
