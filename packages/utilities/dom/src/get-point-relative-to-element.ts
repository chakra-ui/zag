import { getElementOffset } from "./get-element-offset"

type Point = { x: number; y: number }

export function getPointRelativeToNode(point: Point, element: HTMLElement) {
  const offset = getElementOffset(element)
  const x = point.x - offset.left
  const y = point.y - offset.top
  return { x, y }
}
