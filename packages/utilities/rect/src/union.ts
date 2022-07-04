import { getRectFromPoints } from "./from-points"
import type { Rect } from "./rect"

const { min, max } = Math

export function union(...rs: Rect[]): Rect {
  const pMin = {
    x: min.apply(
      Math,
      rs.map((r) => r.minX),
    ),
    y: min.apply(
      Math,
      rs.map((r) => r.minY),
    ),
  }
  const pMax = {
    x: max.apply(
      Math,
      rs.map((r) => r.maxX),
    ),
    y: max.apply(
      Math,
      rs.map((r) => r.maxY),
    ),
  }
  return getRectFromPoints(pMin, pMax)
}
