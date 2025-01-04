import { clamp } from "./shared"
import type { Point } from "./types"

export interface PercentValueOptions {
  inverted?: boolean | { x?: boolean; y?: boolean } | undefined
  dir?: "ltr" | "rtl" | undefined
  orientation?: "vertical" | "horizontal" | undefined
}

export function getRelativePoint(point: Point, element: HTMLElement) {
  const { left, top, width, height } = element.getBoundingClientRect()
  const offset = { x: point.x - left, y: point.y - top }
  const percent = { x: clamp(offset.x / width), y: clamp(offset.y / height) }
  function getPercentValue(options: PercentValueOptions = {}) {
    const { dir = "ltr", orientation = "horizontal", inverted } = options
    const invertX = typeof inverted === "object" ? inverted.x : inverted
    const invertY = typeof inverted === "object" ? inverted.y : inverted
    if (orientation === "horizontal") {
      return dir === "rtl" || invertX ? 1 - percent.x : percent.x
    }
    return invertY ? 1 - percent.y : percent.y
  }
  return { offset, percent, getPercentValue }
}
