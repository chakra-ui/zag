import type { JSX } from "@zag-js/types"
import type { HandlePosition } from "./image-cropper.types"

export function getHandlePositionStyles(handlePosition: HandlePosition): JSX.CSSProperties {
  switch (handlePosition) {
    case "n":
      return {
        position: "absolute",
        cursor: "n-resize",
        width: "96%",
        top: 0,
        left: "50%",
        translate: "-50% -50%",
      }

    case "e":
      return {
        position: "absolute",
        cursor: "e-resize",
        height: "96%",
        right: 0,
        top: "50%",
        translate: "50% -50%",
      }

    case "s":
      return {
        position: "absolute",
        cursor: "s-resize",
        width: "96%",
        bottom: 0,
        left: "50%",
        translate: "-50% 50%",
      }

    case "w":
      return {
        position: "absolute",
        cursor: "w-resize",
        height: "96%",
        left: 0,
        top: "50%",
        translate: "-50% -50%",
      }

    case "se":
      return {
        position: "absolute",
        cursor: "se-resize",
        bottom: 0,
        right: 0,
        translate: "50% 50%",
      }

    case "sw":
      return {
        position: "absolute",
        cursor: "sw-resize",
        bottom: 0,
        left: 0,
        translate: "-50% 50%",
      }

    case "ne":
      return {
        position: "absolute",
        cursor: "ne-resize",
        top: 0,
        right: 0,
        translate: "50% -50%",
      }

    case "nw":
      return {
        position: "absolute",
        cursor: "nw-resize",
        top: 0,
        left: 0,
        translate: "-50% -50%",
      }

    default:
      throw new Error(`Invalid handlePosition: ${handlePosition}`)
  }
}
