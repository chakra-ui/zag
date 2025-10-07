import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./image-cropper.anatomy"
import * as dom from "./image-cropper.dom"
import type { ImageCropperApi, ImageCropperService } from "./image-cropper.types"
import { getEventPoint, contains } from "@zag-js/dom-query"
import { toPx } from "@zag-js/utils"

export function connect<T extends PropTypes>(
  service: ImageCropperService,
  normalize: NormalizeProps<T>,
): ImageCropperApi<T> {
  const { scope, send, context } = service

  const shouldIgnoreTouchPointer = (event: { pointerType?: string; isPrimary?: boolean }) => {
    if (event.pointerType !== "touch") return false
    const isSecondaryTouch = event.isPrimary === false
    const pinchActive = context.get("pinchDistance") != null
    return isSecondaryTouch || pinchActive
  }

  return {
    setZoom(zoom) {
      send({ type: "SET_ZOOM", zoom })
    },

    setRotation(rotation) {
      send({ type: "SET_ROTATION", rotation })
    },

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
        onPointerDown(event) {
          if (event.pointerType === "mouse" && event.button !== 0) return

          if (shouldIgnoreTouchPointer(event)) return

          const zoom = context.get("zoom")
          if (!Number.isFinite(zoom) || zoom <= 1) return

          const target = event.target as HTMLElement | null
          const rootEl = dom.getRootEl(scope)
          if (!target || !rootEl || !contains(rootEl, target)) return

          const selectionEl = dom.getSelectionEl(scope)
          if (contains(selectionEl, target)) return

          const handleEl = target.closest('[data-scope="image-cropper"][data-part="handle"]') as HTMLElement | null
          if (handleEl && contains(rootEl, handleEl)) return

          const point = getEventPoint(event)
          send({ type: "PAN_POINTER_DOWN", point })
        },
        onWheel(event) {
          const viewportEl = event.currentTarget
          if (!viewportEl) return
          const rect = viewportEl.getBoundingClientRect()
          const point = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          }
          send({ type: "ZOOM", trigger: "wheel", delta: event.deltaY, point })
        },
        onTouchStart(event) {
          if (event.touches.length >= 2) {
            const touches = Array.from(event.touches).map((touch) => ({
              x: touch.clientX,
              y: touch.clientY,
            }))

            send({ type: "PINCH_START", touches })
          }
        },
        onTouchMove(event) {
          if (event.touches.length >= 2) {
            event.preventDefault()

            const touches = Array.from(event.touches).map((touch) => ({
              x: touch.clientX,
              y: touch.clientY,
            }))

            send({ type: "PINCH_MOVE", touches })
          }
        },

        onTouchEnd(event) {
          if (event.touches.length < 2) {
            send({ type: "PINCH_END" })
          }
        },
      })
    },

    getImageProps() {
      const zoom = context.get("zoom")
      const offset = context.get("offset")
      const rotation = context.get("rotation")

      const safeNumber = (value: number) => (Number.isFinite(value) ? value : 0)

      const zoomValue = Number.isFinite(zoom) && zoom > 0 ? zoom : 1
      const offsetX = safeNumber(offset?.x)
      const offsetY = safeNumber(offset?.y)
      const rotationValue = safeNumber(rotation)

      const translate = `translate(${toPx(offsetX)}, ${toPx(offsetY)})`
      const rotate = `rotate(${rotationValue}deg)`
      const scale = `scale(${zoomValue})`

      return normalize.element({
        ...parts.image.attrs,
        id: dom.getImageId(scope),
        onLoad(event) {
          const imageEl = event.currentTarget as HTMLImageElement
          if (!imageEl?.complete) return
          const { naturalWidth: width, naturalHeight: height } = imageEl
          send({ type: "SET_NATURAL_SIZE", src: "element", size: { width, height } })
        },
        style: {
          transform: `${translate} ${rotate} ${scale}`,
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
          if (shouldIgnoreTouchPointer(event)) return
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
          if (shouldIgnoreTouchPointer(event)) return
          const point = getEventPoint(event)

          send({ type: "POINTER_DOWN", point, handlePosition: props.position })
        },
      })
    },
  }
}
