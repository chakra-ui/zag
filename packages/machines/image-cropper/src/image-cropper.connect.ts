import { contains, dataAttr, getEventKey, getEventPoint, getEventTarget } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { toPx } from "@zag-js/utils"
import { getHandlePositionStyles } from "./get-resize-axis-style"
import { parts } from "./image-cropper.anatomy"
import * as dom from "./image-cropper.dom"
import type { ImageCropperApi, ImageCropperService } from "./image-cropper.types"
import {
  roundRect,
  isEqualFlip,
  isVisibleRect,
  normalizeFlipState,
  isLeftHandle,
  isRightHandle,
  isTopHandle,
  isBottomHandle,
} from "./image-cropper.utils"

export function connect<T extends PropTypes>(
  service: ImageCropperService,
  normalize: NormalizeProps<T>,
): ImageCropperApi<T> {
  const { scope, send, context, prop, state, computed } = service

  const dragging = state.matches("dragging")
  const panning = state.matches("panning")

  const translations = prop("translations")
  const fixedCropArea = prop("fixedCropArea")
  const cropShape = prop("cropShape")

  const zoom = context.get("zoom")
  const rotation = context.get("rotation")
  const flip = context.get("flip")
  const crop = context.get("crop")
  const offset = context.get("offset")
  const naturalSize = context.get("naturalSize")
  const viewportRect = context.get("viewportRect")

  const isImageReady = computed("isImageReady")
  const isMeasured = computed("isMeasured")
  const roundedCrop = roundRect(crop)

  const shouldIgnoreTouchPointer = (event: { pointerType?: string; isPrimary?: boolean }) => {
    if (event.pointerType !== "touch") return false
    const isSecondaryTouch = event.isPrimary === false
    const pinchActive = context.get("pinchDistance") != null
    return isSecondaryTouch || pinchActive
  }

  return {
    zoom,
    rotation,
    flip,
    crop,
    offset,
    naturalSize,
    viewportRect,
    dragging,
    panning,

    setZoom(value) {
      send({ type: "SET_ZOOM", zoom: value })
    },

    zoomBy(delta) {
      send({ type: "SET_ZOOM", zoom: zoom + delta })
    },

    setRotation(value) {
      send({ type: "SET_ROTATION", rotation: value })
    },

    rotateBy(degrees) {
      send({ type: "SET_ROTATION", rotation: rotation + degrees })
    },

    setFlip(nextFlip) {
      if (!nextFlip) return
      const normalized = normalizeFlipState(nextFlip, flip)
      if (isEqualFlip(normalized, flip)) return
      send({ type: "SET_FLIP", flip: normalized })
    },

    flipHorizontally(value) {
      const nextValue = typeof value === "boolean" ? value : !flip.horizontal
      if (nextValue === flip.horizontal) return
      send({ type: "SET_FLIP", flip: { horizontal: nextValue } })
    },

    flipVertically(value) {
      const nextValue = typeof value === "boolean" ? value : !flip.vertical
      if (nextValue === flip.vertical) return
      send({ type: "SET_FLIP", flip: { vertical: nextValue } })
    },

    resize(handlePosition, delta) {
      if (!handlePosition) return
      if (fixedCropArea) return

      let deltaX = 0
      let deltaY = 0

      if (isLeftHandle(handlePosition)) {
        deltaX = -delta
      } else if (isRightHandle(handlePosition)) {
        deltaX = delta
      }

      if (isTopHandle(handlePosition)) {
        deltaY = -delta
      } else if (isBottomHandle(handlePosition)) {
        deltaY = delta
      }

      send({ type: "RESIZE_CROP", handlePosition, delta: { x: deltaX, y: deltaY } })
    },

    reset() {
      send({ type: "RESET" })
    },

    getCropData() {
      // Calculate scale factor from viewport to natural image coordinates
      const scale = naturalSize.width / viewportRect.width

      // Transform viewport crop coordinates to natural image pixel coordinates
      const naturalX = (crop.x - offset.x) * scale
      const naturalY = (crop.y - offset.y) * scale
      const naturalWidth = crop.width * scale
      const naturalHeight = crop.height * scale

      return {
        x: Math.round(naturalX),
        y: Math.round(naturalY),
        width: Math.round(naturalWidth),
        height: Math.round(naturalHeight),
        rotate: rotation,
        flipX: flip.horizontal,
        flipY: flip.vertical,
      }
    },

    async getCroppedImage(options = {}) {
      const { type = "image/png", quality = 1, output = "blob" } = options
      if (!isVisibleRect(naturalSize)) return null

      const canvas = dom.drawCroppedImageToCanvas(service)
      if (!canvas) return null

      if (output === "dataUrl") {
        return canvas.toDataURL(type, quality)
      }

      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (blob) => {
            resolve(blob)
          },
          type,
          quality,
        )
      })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        dir: prop("dir"),
        role: "group",
        "aria-roledescription": translations.rootRoleDescription,
        "aria-label": translations.rootLabel,
        "aria-description": isImageReady
          ? translations.previewDescription({
              crop: roundedCrop,
              zoom: Number.isFinite(zoom) ? zoom : null,
              rotation: Number.isFinite(rotation) ? rotation : null,
            })
          : translations.previewLoading,
        "aria-live": "polite",
        "aria-controls": `${dom.getViewportId(scope)} ${dom.getSelectionId(scope)}`,
        "aria-busy": isImageReady ? undefined : "true",
        "data-fixed": dataAttr(fixedCropArea),
        "data-shape": cropShape,
        "data-pinch": dataAttr(context.get("pinchDistance") != null),
        "data-dragging": dataAttr(dragging),
        "data-panning": dataAttr(panning),
        style: {
          "--crop-width": toPx(crop.width),
          "--crop-height": toPx(crop.height),
          "--crop-x": toPx(crop.x),
          "--crop-y": toPx(crop.y),
          "--image-zoom": zoom,
          "--image-rotation": rotation,
          "--image-offset-x": toPx(offset.x),
          "--image-offset-y": toPx(offset.y),
        },
      })
    },

    getViewportProps() {
      const viewportId = dom.getViewportId(scope)

      return normalize.element({
        ...parts.viewport.attrs,
        id: viewportId,
        role: "presentation",
        "data-ownedby": dom.getRootId(scope),
        "data-disabled": dataAttr(!!fixedCropArea),
        style: {
          position: "relative",
          overflow: "hidden",
          touchAction: "none",
          userSelect: "none",
        },
        onPointerDown(event) {
          if (event.pointerType === "mouse" && event.button !== 0) return
          if (shouldIgnoreTouchPointer(event)) return

          const target = getEventTarget<HTMLElement>(event)
          const rootEl = dom.getRootEl(scope)

          if (!target || !rootEl || !contains(rootEl, target)) return

          const selectionEl = dom.getSelectionEl(scope)
          if (!fixedCropArea && contains(selectionEl, target)) return

          const handleEl = target.closest('[data-scope="image-cropper"][data-part="handle"]') as HTMLElement | null
          if (handleEl && contains(rootEl, handleEl)) return

          const point = getEventPoint(event)
          send({ type: "PAN_POINTER_DOWN", point })
        },
      })
    },

    getImageProps() {
      const flipHorizontal = flip.horizontal
      const flipVertical = flip.vertical

      const translate = `translate(${toPx(offset.x)}, ${toPx(offset.y)})`
      const rotate = `rotate(${rotation}deg)`
      const scaleX = zoom * (flipHorizontal ? -1 : 1)
      const scaleY = zoom * (flipVertical ? -1 : 1)
      const scale = `scale(${scaleX}, ${scaleY})`

      return normalize.element({
        ...parts.image.attrs,
        id: dom.getImageId(scope),
        draggable: false,
        role: "presentation",
        alt: "",
        "aria-hidden": true,
        "data-ownedby": dom.getViewportId(scope),
        "data-ready": dataAttr(isImageReady),
        "data-flip-horizontal": dataAttr(flipHorizontal),
        "data-flip-vertical": dataAttr(flipVertical),
        onLoad(event) {
          const imageEl = event.currentTarget as HTMLImageElement
          if (!imageEl?.complete) return
          const { naturalWidth: width, naturalHeight: height } = imageEl
          send({ type: "SET_NATURAL_SIZE", src: "element", size: { width, height } })
        },
        style: {
          pointerEvents: "none",
          userSelect: "none",
          transform: `${translate} ${rotate} ${scale}`,
          willChange: "transform",
        },
      })
    },

    getSelectionProps() {
      const disabled = !!fixedCropArea
      return normalize.element({
        ...parts.selection.attrs,
        id: dom.getSelectionId(scope),
        tabIndex: disabled ? undefined : 0,
        role: "slider",
        "aria-label": translations.selectionLabel({ shape: cropShape }),
        "aria-roledescription": translations.selectionRoleDescription,
        "aria-disabled": disabled ? "true" : undefined,
        "aria-valuemin": 0,
        "aria-valuemax": isVisibleRect(viewportRect)
          ? Math.max(0, Math.round(viewportRect.width - crop.width))
          : Math.max(roundedCrop.x, 0),
        "aria-valuenow": roundedCrop.x,
        "aria-valuetext": translations.selectionValueText({ shape: cropShape, ...roundedCrop }),
        "aria-description": translations.selectionInstructions,
        "data-disabled": dataAttr(disabled),
        "data-shape": cropShape,
        "data-measured": dataAttr(isMeasured),
        "data-dragging": dataAttr(dragging),
        "data-panning": dataAttr(panning),
        style: {
          position: "absolute",
          top: "var(--crop-y)",
          left: "var(--crop-x)",
          width: "var(--crop-width)",
          height: "var(--crop-height)",
          touchAction: "none",
          visibility: isMeasured ? undefined : "hidden",
        },
        onPointerDown(event) {
          if (disabled) {
            event.preventDefault()
            return
          }
          if (shouldIgnoreTouchPointer(event)) return
          const point = getEventPoint(event)
          send({ type: "POINTER_DOWN", point })
        },
        onKeyDown(event) {
          if (disabled) {
            event.preventDefault()
            return
          }
          if (event.defaultPrevented) return
          const src = "selection"
          const { shiftKey, ctrlKey, metaKey, altKey } = event
          const key = getEventKey(event, { dir: prop("dir") })

          const isZoomInKey = key === "+" || key === "="
          const isZoomOutKey = key === "-" || key === "_"

          if (isZoomInKey || isZoomOutKey) {
            const delta = isZoomInKey ? -1 : 1
            send({ type: "ZOOM", trigger: "keyboard", delta })
            event.preventDefault()
            return
          }

          if (altKey && (key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight")) {
            const handlePosition = key === "ArrowUp" || key === "ArrowDown" ? "s" : "e"
            send({
              type: "NUDGE_RESIZE_CROP",
              handlePosition,
              key,
              src,
              shiftKey,
              ctrlKey,
              metaKey,
            })
            event.preventDefault()
            return
          }

          const keyMap: EventKeyMap = {
            ArrowUp() {
              send({ type: "NUDGE_MOVE_CROP", key: "ArrowUp", src, shiftKey, ctrlKey, metaKey })
            },
            ArrowDown() {
              send({ type: "NUDGE_MOVE_CROP", key: "ArrowDown", src, shiftKey, ctrlKey, metaKey })
            },
            ArrowLeft() {
              send({ type: "NUDGE_MOVE_CROP", key: "ArrowLeft", src, shiftKey, ctrlKey, metaKey })
            },
            ArrowRight() {
              send({ type: "NUDGE_MOVE_CROP", key: "ArrowRight", src, shiftKey, ctrlKey, metaKey })
            },
          }
          const exec = keyMap[key]

          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
      })
    },

    getHandleProps(props) {
      const handlePosition = props.position
      const disabled = !!fixedCropArea

      return normalize.element({
        ...parts.handle.attrs,
        id: dom.getHandleId(scope, handlePosition),
        "data-position": handlePosition,
        "aria-hidden": "true",
        role: "presentation",
        "data-disabled": dataAttr(disabled),
        style: getHandlePositionStyles(handlePosition),
        onPointerDown(event) {
          if (disabled) {
            event.preventDefault()
            return
          }
          if (shouldIgnoreTouchPointer(event)) return
          const point = getEventPoint(event)

          send({ type: "POINTER_DOWN", point, handlePosition })
        },
      })
    },

    getGridProps(props) {
      const axis = props.axis
      const isMeasured = computed("isMeasured")

      return normalize.element({
        ...parts.grid.attrs,
        "aria-hidden": "true",
        "data-axis": axis,
        "data-dragging": dataAttr(dragging),
        "data-panning": dataAttr(panning),
        style: {
          position: "absolute",
          inset: axis === "horizontal" ? "33.33% 0" : "0 33.33%",
          pointerEvents: "none",
          visibility: isMeasured ? undefined : "hidden",
        },
      })
    },
  }
}
