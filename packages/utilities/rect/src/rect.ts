import { hasProp } from "@zag-js/utils"
import type { RectEdge, RectValue } from "./types"

const point = (x: number, y: number) => ({ x, y })

export function createRect(v: RectValue) {
  const midX = v.x + v.width / 2
  const midY = v.y + v.height / 2
  return {
    ...v,
    minX: v.x,
    minY: v.y,
    maxX: v.x + v.width,
    maxY: v.y + v.height,
    midX,
    midY,
    center: point(midX, midY),
  }
}

export type Rect = ReturnType<typeof createRect>

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
