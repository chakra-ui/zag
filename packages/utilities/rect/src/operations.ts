import { createRect } from "./rect"
import type { Point, Rect, RectInset, SymmetricRectInset } from "./types"

export const isSymmetric = (v: any): v is SymmetricRectInset => "dx" in v || "dy" in v

export function inset(r: Rect, i: RectInset | SymmetricRectInset): Rect {
  const v = isSymmetric(i) ? { left: i.dx, right: i.dx, top: i.dy, bottom: i.dy } : i
  const { top = 0, right = 0, bottom = 0, left = 0 } = v
  return createRect({
    x: r.x + left,
    y: r.y + top,
    width: r.width - left - right,
    height: r.height - top - bottom,
  })
}

export function expand(r: Rect, v: number | SymmetricRectInset): Rect {
  const value = typeof v === "number" ? { dx: -v, dy: -v } : v
  return inset(r, value)
}

export function shrink(r: Rect, v: number | SymmetricRectInset): Rect {
  const value = typeof v === "number" ? { dx: -v, dy: -v } : v
  return inset(r, value)
}

export function shift(r: Rect, o: Partial<Point>): Rect {
  const { x = 0, y = 0 } = o
  return createRect({
    x: r.x + x,
    y: r.y + y,
    width: r.width,
    height: r.height,
  })
}
