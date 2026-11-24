import { createRect, getRectCorners } from "./rect"
import type { Point, Rect } from "./types"

export function toRad(d: number) {
  return ((d % 360) * Math.PI) / 180
}

export function rotate(a: Point, d: number, c: Point): Point {
  const r = toRad(d)

  const sin = Math.sin(r)
  const cos = Math.cos(r)

  const x = a.x - c.x
  const y = a.y - c.y

  return {
    x: c.x + x * cos - y * sin,
    y: c.y + x * sin + y * cos,
  }
}

export function getRotationRect(r: Rect, deg: number): Rect {
  const rr = Object.values(getRectCorners(r)).map((p) => rotate(p, deg, r.center))

  const xs = rr.map((p) => p.x)
  const ys = rr.map((p) => p.y)

  const minX = Math.min(...xs)
  const minY = Math.min(...ys)

  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)

  return createRect({
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  })
}
