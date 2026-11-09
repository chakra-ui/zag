import type { PlacementSide } from "@zag-js/popper"
import type { ViewportSize } from "./hover-card.types"

export function getViewportSizeStyle(size: ViewportSize | null) {
  if (!size) return {}
  return {
    "--viewport-width": `${size.width}px`,
    "--viewport-height": `${size.height}px`,
    width: "var(--viewport-width)",
    height: "var(--viewport-height)",
  }
}

export function getViewportStyle(side: PlacementSide | undefined) {
  return {
    position: "absolute",
    width: "var(--viewport-width)",
    height: "var(--viewport-height)",
    top: side === "top" ? undefined : "0px",
    bottom: side === "top" ? "0px" : undefined,
    left: side === "left" ? undefined : "0px",
    right: side === "left" ? "0px" : undefined,
  } as const
}
