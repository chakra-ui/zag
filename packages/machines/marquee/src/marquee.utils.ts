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
