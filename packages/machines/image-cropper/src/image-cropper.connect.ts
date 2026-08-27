import { contains, dataAttr, getEventKey, getEventPoint, getEventTarget } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes, Required } from "@zag-js/types"
import { mergeWithDefault, toPx } from "@zag-js/utils"
import { getHandlePositionStyles } from "./get-resize-axis-style"
import { parts } from "./image-cropper.anatomy"
import * as dom from "./image-cropper.dom"
import type { ImageCropperApi, ImageCropperService, IntlTranslations } from "./image-cropper.types"
import {
  roundRect,
  isEqualFlip,
  isVisibleRect,
  normalizeFlipState,
  isLeftHandle,
  isRightHandle,
  isTopHandle,
  isBottomHandle,
} from "./utils/crop"
import { getCropSourceRect, getCropSourcePoints, getImageTransformCss, getNaturalCropSize } from "./utils/transform"

const defaultTranslations: Required<IntlTranslations> = {
  rootLabel: "Image cropper",
  rootRoleDescription: "Image cropper",
  previewLoading: "Image cropper preview loading",
  previewDescription({ crop, zoom, rotation }) {
    const zoomText = zoom != null && Number.isFinite(zoom) ? `${zoom.toFixed(2)}x zoom` : "default zoom"
    const rotationText =
      rotation != null && Number.isFinite(rotation) ? `${Math.round(rotation)} degrees rotation` : "0 degrees rotation"
    return `Image cropper preview, ${zoomText}, ${rotationText}. Crop positioned at ${crop.x}px from the left and ${crop.y}px from the top with a size of ${crop.width}px by ${crop.height}px.`
  },
  selectionLabel: ({ shape }) => `Crop selection area (${shape === "circle" ? "circle" : "rectangle"})`,
  selectionRoleDescription: "2d slider",
  selectionInstructions:
    "Use arrow keys to move the crop. Hold Alt with arrow keys to resize width or height. Press plus or minus to zoom.",
  selectionValueText({ shape, x, y, width, height }) {
    if (shape === "circle") {
      return `Position X ${x}px, Y ${y}px. Diameter ${width}px.`
    }
    return `Position X ${x}px, Y ${y}px. Size ${width}px by ${height}px.`
  },
}

export function connect<T extends PropTypes>(
  service: ImageCropperService,
  normalize: NormalizeProps<T>,
): ImageCropperApi<T> {
  const { scope, send, context, prop, state, computed } = service

  const dragging = state.matches("dragging")
  const panning = state.matches("panning")

  const translations = mergeWithDefault(defaultTranslations, prop("translations"))
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
      const exportParams = dom.getCropExportParams(service)
      const sourceRect = getCropSourceRect(exportParams)

      return {
        x: Math.round(sourceRect.x),
        y: Math.round(sourceRect.y),
        width: Math.round(sourceRect.width),
        height: Math.round(sourceRect.height),
        corners: getCropSourcePoints(exportParams),
        outputSize: getNaturalCropSize(exportParams),
        rotate: rotation,
        flipX: flip.horizontal,
        flipY: flip.vertical,
      }
    },

    async getCroppedImage(options = {}) {
      const { type = "image/png", quality = 1, output = "blob" } = options
      if (!isVisibleRect(naturalSize)) return null

      const canvas = dom.drawCroppedImageToCanvas(service, options)
      if (!canvas) return null

      try {
        if (output === "dataUrl") {
          const dataUrl = canvas.toDataURL(type, quality)
          return dataUrl === "data:," ? null : dataUrl
        }

        return await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, type, quality)
        })
      } catch {
        return null
      }
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

      const transform = getImageTransformCss({ zoom, offset, rotation, flip })

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
          objectFit: "fill",
          transform,
          transformOrigin: "center center",
          willChange: "transform",
        },
      })
    },

    getSelectionProps() {
      const disabled = !!fixedCropArea
      return normalize.element({
        ...parts.selection.attrs,
        id: dom.getSelectionId(scope),
        tabIndex: 0,
        role: "slider",
        "aria-label": translations.selectionLabel({ shape: cropShape }),
        "aria-roledescription": translations.selectionRoleDescription,
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

          const isArrowKey = key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight"
          if (!isArrowKey) return

          // In fixed crop mode there's nothing to resize or move, plain arrow keys pan the image instead.
          // Alt+Arrow keeps meaning "resize", which doesn't apply here, so it's a no-op.
          if (disabled) {
            if (altKey) return
            send({ type: "NUDGE_PAN", key, src, shiftKey, ctrlKey, metaKey })
            event.preventDefault()
            return
          }

          if (altKey) {
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

          send({ type: "NUDGE_MOVE_CROP", key, src, shiftKey, ctrlKey, metaKey })
          event.preventDefault()
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
