import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./image-cropper.anatomy"
import * as dom from "./image-cropper.dom"
import type { ImageCropperApi, ImageCropperService } from "./image-cropper.types"
import { getEventPoint } from "@zag-js/dom-query"
import { toPx } from "@zag-js/utils"

export function connect<T extends PropTypes>(
  service: ImageCropperService,
  normalize: NormalizeProps<T>,
): ImageCropperApi<T> {
  const { scope, send, context } = service

  return {
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
      })
    },

    getViewportProps() {
      return normalize.element({
        ...parts.viewport.attrs,
        id: dom.getViewportId(scope),
      })
    },

    getImageProps() {
      return normalize.element({
        ...parts.image.attrs,
        id: dom.getImageId(scope),
        onLoad(event) {
          const imageEl = event.currentTarget as HTMLImageElement
          if (!imageEl?.complete) return
          const { naturalWidth: width, naturalHeight: height } = imageEl
          send({ type: "SET_NATURAL_SIZE", src: "element", size: { width, height } })
        },
      })
    },

    getSelectionProps() {
      const crop = context.get("crop")

      return normalize.element({
        ...parts.selection.attrs,
        id: dom.getSelectionId(scope),
        style: {
          "--width": toPx(crop.width),
          "--height": toPx(crop.height),
          "--x": toPx(crop.x),
          "--y": toPx(crop.y),
          top: "var(--y)",
          left: "var(--x)",
          width: "var(--width)",
          height: "var(--height)",
        },
        onPointerDown(event) {
          const point = getEventPoint(event)
          send({ type: "POINTER_DOWN", point })
        },
      })
    },

    getOverlayProps() {
      return normalize.element({
        ...parts.overlay.attrs,
        id: dom.getOverlayId(scope),
      })
    },

    getHandleProps(props) {
      return normalize.element({
        ...parts.handle.attrs,
        id: dom.getHandleId(scope, props.position),
        "data-position": props.position,
        onPointerDown(event) {
          const point = getEventPoint(event)

          send({ type: "POINTER_DOWN", point, handlePosition: props.position })
        },
      })
    },
  }
}
