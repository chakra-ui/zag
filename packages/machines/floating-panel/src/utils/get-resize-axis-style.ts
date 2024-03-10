import type { JSX } from "@zag-js/types"
import type { ResizeTriggerAxis } from "../floating-panel.types"

export function getResizeAxisStyle(axis: ResizeTriggerAxis): JSX.CSSProperties {
  switch (axis) {
    case "n":
      return {
        cursor: "n-resize",
        left: 0,
        width: "100%",
      }

    case "e":
      return {
        cursor: "e-resize",
        right: 0,
        height: "100%",
      }

    case "s":
      return {
        cursor: "s-resize",
        bottom: 0,
        width: "100%",
      }

    case "w":
      return {
        cursor: "w-resize",
        left: 0,
        height: "100%",
      }

    case "se":
      return {
        cursor: "se-resize",
        bottom: 0,
        right: 0,
      }

    case "sw":
      return {
        cursor: "sw-resize",
        bottom: 0,
        left: 0,
      }

    case "ne":
      return {
        cursor: "ne-resize",
        top: 0,
        right: 0,
      }

    case "nw":
      return {
        cursor: "nw-resize",
        top: 0,
        left: 0,
      }

    default:
      throw new Error(`Invalid axis: ${axis}`)
  }
}
