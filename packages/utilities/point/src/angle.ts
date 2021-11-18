import { point } from "."
import type { Point } from "./types"

export function toDeg(r: number) {
  return ((180 * r) / Math.PI) % 360
}

export function toRad(d: number) {
  return ((d % 360) * Math.PI) / 180
}

export function angleBetween(a: Point, b: Point): number {
  return Math.atan2(a.y - b.y, a.x - b.x)
}

export function rotate(a: Point, d: number, c: Point): Point {
  const r = toRad(d)
  const sin = Math.sin(r)
  const cos = Math.cos(r)
  const x = a.x - c.x
  const y = a.y - c.y
  return point(c.x + x * cos - y * sin, c.y + x * sin + y * cos)
}
