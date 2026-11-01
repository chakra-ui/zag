import { getComputedStyle } from "@zag-js/dom-query"
import type { Direction, ScrollAxis } from "./types"

export const getDirection = (element: HTMLElement) => getComputedStyle(element).direction as Direction

const toPx = (raw: string, size: number) => (parseFloat(raw) || 0) * (raw.includes("%") ? size / 100 : 1)

export function getScrollPadding(element: HTMLElement): Record<ScrollAxis, { before: number; after: number }> {
  const style = getComputedStyle(element)
  // Layout size, so transforms like a dialog's scale() animation don't skew percentages
  const width = element.offsetWidth
  const height = element.offsetHeight
  const pad = (side: string, size: number) => toPx(style.getPropertyValue(`scroll-padding-${side}`), size)
  return {
    x: { before: pad("left", width), after: pad("right", width) },
    y: { before: pad("top", height), after: pad("bottom", height) },
  }
}

export const uniq = <T>(arr: T[]): T[] => [...new Set(arr)]

export const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value))
