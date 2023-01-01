import { getElementOffset } from "./get-element-offset"

type Point = { x: number; y: number }

export function getPointRelativeToNode(point: Point, element: HTMLElement) {
  const offset = getElementOffset(element)
  const x = point.x - offset.left
  const y = point.y - offset.top
  return { x, y }
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, value))

export function getPointPercentRelativeToNode(point: Point, element: HTMLElement) {
  const pt = getPointRelativeToNode(point, element)
  const x = (pt.x / element.offsetWidth) * 100
  const y = (pt.y / element.offsetHeight) * 100
  return { x: clampPercent(x), y: clampPercent(y) }
}

export function normalizePointValue(
  point: Point,
  options: {
    dir?: "ltr" | "rtl"
    orientation?: "vertical" | "horizontal"
  },
): number {
  const { dir = "ltr", orientation = "horizontal" } = options
  const { x, y } = point

  let result = { x, y }

  if (orientation === "horizontal" && dir === "rtl") {
    result = { x: 100 - x, y }
  }

  return orientation === "horizontal" ? result.x : result.y
}
