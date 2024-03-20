import type { JSX } from "@zag-js/types"
import type { ResizeTriggerAxis } from "../floating-panel.types"

export function getResizeAxisStyle(axis: ResizeTriggerAxis): JSX.CSSProperties {
  switch (axis) {
    case "n":
      return {
        cursor: "n-resize",
        width: "100%",
        left: "50%",
        translate: "-50%",
      }

    case "e":
      return {
        cursor: "e-resize",
        height: "100%",
        right: 0,
        top: "50%",
        translate: "0 -50%",
      }

    case "s":
      return {
        cursor: "s-resize",
        width: "100%",
        bottom: 0,
        left: "50%",
        translate: "-50%",
      }

    case "w":
      return {
        cursor: "w-resize",
        height: "100%",
        left: 0,
        top: "50%",
        translate: "0 -50%",
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
