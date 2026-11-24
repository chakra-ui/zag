import { createRect, getRectCorners } from "./rect"
import type { Point, RectInit } from "./types"

export function getElementPolygon(rectValue: RectInit, placement: string) {
  const rect = createRect(rectValue)
  const { top, right, left, bottom } = getRectCorners(rect)
  const [base] = placement.split("-")

  return {
    top: [left, top, right, bottom],
    right: [top, right, bottom, left],
    bottom: [top, left, bottom, right],
    left: [right, top, left, bottom],
  }[base]
}

export function isPointInPolygon(polygon: Point[], point: Point) {
  const { x, y } = point
  let c = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      c = !c
    }
  }
  return c
}
