import { point, Point } from "@ui-machines/point-utils"
import type { Rect, RectCenters, RectCorners, RectEdge, RectEdges, RectValue } from "./types"

export function rect(x: number, y: number, w: number, h: number): Rect
export function rect(v: RectValue): Rect
export function rect(...a: any[]): Rect {
  const r = a.length === 4 ? { x: a[0], y: a[1], width: a[2], height: a[3] } : a[0]
  return Object.freeze(
    Object.assign({}, r, {
      area: r.width * r.height,
      minX: r.x,
      midX: r.x + r.width / 2,
      maxX: r.x + r.width,
      minY: r.y,
      midY: r.y + r.height / 2,
      maxY: r.y + r.height,
    }),
  )
}

export function isRect(v: any): v is RectValue {
  return ["x", "y", "width", "height"].every((k) => k in v)
}

export function equal(a: Rect, b: Rect): boolean {
  return ["x", "y", "width", "height"].every((k) => a[k] === b[k])
}

export function center(a: Rect): Point {
  return point(a.midX, a.midY)
}

export function centers(a: Rect): RectCenters {
  const t = point(a.midX, a.minY)
  const r = point(a.maxX, a.midY)
  const b = point(a.midX, a.maxY)
  const l = point(a.minX, a.midY)
  return {
    topCenter: t,
    rightCenter: r,
    bottomCenter: b,
    leftCenter: l,
    value: [t, r, b, l],
  }
}

export function corners(a: Rect): RectCorners {
  const tl = point(a.minX, a.minY)
  const tr = point(a.maxX, a.minY)
  const br = point(a.minX, a.maxY)
  const bl = point(a.maxX, a.maxY)
  return {
    topLeft: tl,
    topRight: tr,
    bottomRight: br,
    bottomLeft: bl,
    value: [tl, tr, br, bl],
  }
}

export function edges(a: Rect): RectEdges {
  const c = corners(a)
  const t: RectEdge = [c.topLeft, c.topRight]
  const r: RectEdge = [c.topRight, c.bottomRight]
  const b: RectEdge = [c.bottomLeft, c.bottomRight]
  const l: RectEdge = [c.topLeft, c.bottomLeft]
  return {
    top: t,
    right: r,
    bottom: b,
    left: l,
    value: [t, r, b, l],
  }
}

export * from "./types"
