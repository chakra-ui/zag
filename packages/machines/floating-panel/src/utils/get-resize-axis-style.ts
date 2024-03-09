import type { JSX } from "@zag-js/types"
import type { ResizeTriggerAxis } from "../floating-panel.types"

export function getResizeAxisStyle(axis: ResizeTriggerAxis): JSX.CSSProperties {
  switch (axis) {
    case "s":
      return {
        cursor: "ns-resize",
        bottom: 0,
        left: 0,
        right: 0,
        height: 8,
      }

    case "w":
      return {
        cursor: "ew-resize",
        top: 0,
        left: 0,
        bottom: 0,
        width: 8,
      }

    case "e":
      return {
        cursor: "ew-resize",
        top: 0,
        right: 0,
        bottom: 0,
        width: 8,
      }

    case "n":
      return {
        cursor: "ns-resize",
        top: 0,
        left: 0,
        right: 0,
        height: 8,
      }

    case "sw":
      return {
        cursor: "sw-resize",
        bottom: 0,
        left: 0,
        width: 8,
        height: 8,
      }

    case "nw":
      return {
        cursor: "nw-resize",
        top: 0,
        left: 0,
        width: 8,
        height: 8,
      }

    case "se":
      return {
        cursor: "se-resize",
        bottom: 0,
        right: 0,
        width: 8,
        height: 8,
      }

    case "ne":
      return {
        cursor: "ne-resize",
        top: 0,
        right: 0,
        width: 8,
        height: 8,
      }

    default:
      throw new Error(`Invalid axis: ${axis}`)
  }
}
