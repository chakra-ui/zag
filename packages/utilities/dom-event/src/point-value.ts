import { getElementOffset } from "./get-element-offset"

const clamp = (value: number) => Math.max(0, Math.min(1, value))

type Point = { x: number; y: number }

export function getRelativePointValue(absolutePoint: Point, element: HTMLElement) {
  const offset = getElementOffset(element)
  const x = absolutePoint.x - offset.left
  const y = absolutePoint.y - offset.top
  return {
    x,
    y,
    getDelta(origin: Point) {
      return { x: x - origin.x, y: y - origin.y }
    },
  }
}

export function getRelativePointPercent(absolutePoint: Point, element: HTMLElement) {
  const relativePoint = getRelativePointValue(absolutePoint, element)
  const x = clamp(relativePoint.x / element.offsetWidth) * 100
  const y = clamp(relativePoint.y / element.offsetHeight) * 100
  return {
    x,
    y,
    normalize(options: NormalizeOptions = {}) {
      const { dir = "ltr", orientation = "horizontal" } = options
      let newX = x
      if (orientation === "horizontal" && dir === "rtl") newX = 100 - newX
      return orientation === "horizontal" ? newX : y
    },
  }
}

type NormalizeOptions = {
  dir?: "ltr" | "rtl"
  orientation?: "vertical" | "horizontal"
}
