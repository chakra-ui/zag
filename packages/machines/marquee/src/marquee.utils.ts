import type { Direction, Style } from "@zag-js/types"
import type { Side } from "./marquee.types"

interface PositionOptions {
  side: Side
  dir: Direction
}

export const getEdgePositionStyles = (options: PositionOptions): Style => {
  const { side } = options
  switch (side) {
    case "start":
      return {
        top: 0,
        insetInlineStart: 0,
        height: "100%",
      }
    case "end":
      return {
        top: 0,
        insetInlineEnd: 0,
        height: "100%",
      }
    case "top":
      return {
        top: 0,
        insetInline: 0,
        width: "100%",
      }
    case "bottom":
      return {
        bottom: 0,
        insetInline: 0,
        width: "100%",
      }
  }
}

export const getMarqueeTranslate = (options: PositionOptions): string => {
  const { side, dir } = options

  if (side === "top") {
    return "-100%"
  }

  if (side === "bottom") {
    return "100%"
  }

  // Horizontal: start/end
  const shouldBeNegative = (side === "start" && dir === "ltr") || (side === "end" && dir === "rtl")
  return shouldBeNegative ? "-100%" : "100%"
}

interface DurationOptions {
  rootSize: number
  contentSize: number
  speed: number
  multiplier: number
  autoFill: boolean
}

export function calculateDuration(options: DurationOptions): number {
  const { contentSize, speed, multiplier, autoFill } = options

  if (autoFill) {
    return (contentSize * multiplier) / speed
  }

  // Each content element is translated by 100% of its own size, so the animation distance is
  // always the content size, regardless of the viewport size. Using the root size here made
  // the effective speed scale with the content/viewport ratio when the content was smaller
  // than the viewport.
  return contentSize / speed
}
