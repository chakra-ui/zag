import type { Point, Rect, RectEdge, RectInit } from "./types"

/* -----------------------------------------------------------------------------
 * Point
 * -----------------------------------------------------------------------------*/

export const createPoint = (x: number, y: number) => ({ x, y })

export const subtractPoints = (a: Point, b: Point) => createPoint(a.x - b.x, a.y - b.y)
export const addPoints = (a: Point, b: Point) => createPoint(a.x + b.x, a.y + b.y)

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
