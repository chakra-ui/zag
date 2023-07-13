import { createRect, type Rect } from "./rect"
import type { Point } from "./types"

export function getRectFromPoints(...pts: Point[]): Rect {
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)

  const x = Math.min(...xs)
  const y = Math.min(...ys)

  const width = Math.max(...xs) - x
  const height = Math.max(...ys) - y

  return createRect({ x, y, width, height })
}
