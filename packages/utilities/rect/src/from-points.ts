import type { Point } from "@ui-machines/point-utils"
import { rect } from "."
import type { Rect } from "./types"

export function fromPoints(...pts: Point[]): Rect {
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const x = Math.min.apply(Math, xs)
  const y = Math.min.apply(Math, ys)
  const width = Math.max.apply(Math, xs) - x
  const height = Math.max.apply(Math, ys) - y
  return rect(x, y, width, height)
}
