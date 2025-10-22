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
    return "calc(-100% - var(--marquee-spacing))"
  }

  if (side === "bottom") {
    return "calc(100% + var(--marquee-spacing))"
  }

  // Horizontal: start/end
  const shouldBeNegative = (side === "start" && dir === "ltr") || (side === "end" && dir === "rtl")
  return shouldBeNegative ? "calc(-100% - var(--marquee-spacing))" : "calc(100% + var(--marquee-spacing))"
}
