import type { EventKeyMap, NormalizeProps, PropTypes, Rect } from "@zag-js/types"
import { parts } from "./image-cropper.anatomy"
import * as dom from "./image-cropper.dom"
import type { FlipState, ImageCropperApi, ImageCropperService } from "./image-cropper.types"
import { getEventPoint, contains, getEventKey, dataAttr } from "@zag-js/dom-query"
import { toPx } from "@zag-js/utils"
import { getHandleDirections } from "./image-cropper.utils"

const getRoundedCrop = (crop: Rect) => ({
  x: Math.round(crop.x),
  y: Math.round(crop.y),
  width: Math.round(crop.width),
  height: Math.round(crop.height),
})

const toFiniteDataValue = (value: number) => (Number.isFinite(value) ? String(value) : undefined)

export function connect<T extends PropTypes>(
  service: ImageCropperService,
  normalize: NormalizeProps<T>,
): ImageCropperApi<T> {
  const { scope, send, context, prop, state } = service
  const translations = prop("translations")

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

    setFlip(nextFlip) {
      if (!nextFlip) return
      const currentFlip = context.get("flip")
      const normalized: FlipState = {
        horizontal: typeof nextFlip.horizontal === "boolean" ? nextFlip.horizontal : currentFlip.horizontal,
        vertical: typeof nextFlip.vertical === "boolean" ? nextFlip.vertical : currentFlip.vertical,
      }
      if (normalized.horizontal === currentFlip.horizontal && normalized.vertical === currentFlip.vertical) return
      send({ type: "SET_FLIP", flip: normalized })
    },

    flipHorizontally(value) {
      const currentFlip = context.get("flip")
      const nextValue = typeof value === "boolean" ? value : !currentFlip.horizontal
      if (nextValue === currentFlip.horizontal) return
      send({ type: "SET_FLIP", flip: { horizontal: nextValue } })
    },

    flipVertically(value) {
      const currentFlip = context.get("flip")
      const nextValue = typeof value === "boolean" ? value : !currentFlip.vertical
      if (nextValue === currentFlip.vertical) return
      send({ type: "SET_FLIP", flip: { vertical: nextValue } })
    },

    resize(handlePosition, delta) {
      if (!handlePosition) return
      if (prop("fixedCropArea")) return

      const { hasLeft, hasRight, hasTop, hasBottom } = getHandleDirections(handlePosition)

      let deltaX = 0
      let deltaY = 0

      if (hasLeft) {
        deltaX = -delta
      } else if (hasRight) {
        deltaX = delta
      }

      if (hasTop) {
        deltaY = -delta
      } else if (hasBottom) {
        deltaY = delta
      }

      send({ type: "RESIZE_CROP", handlePosition, delta: { x: deltaX, y: deltaY } })
    },

    async getCroppedImage(options = {}) {
      const { type = "image/png", quality = 1, output = "blob" } = options

      const imageEl = dom.getImageEl(scope)
      if (!imageEl || !imageEl.complete) return null

      const naturalSize = context.get("naturalSize")
      if (naturalSize.width === 0 || naturalSize.height === 0) return null

      const crop = context.get("crop")
      const zoom = context.get("zoom")
      const rotation = context.get("rotation")
      const flip = context.get("flip")
      const offset = context.get("offset")
      const viewportRect = context.get("viewportRect")

      const canvas = document.createElement("canvas")
      canvas.width = crop.width
      canvas.height = crop.height

      const ctx = canvas.getContext("2d")
      if (!ctx) return null

      ctx.save()

      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)

      const scaleX = flip.horizontal ? -1 : 1
      const scaleY = flip.vertical ? -1 : 1
      ctx.scale(scaleX, scaleY)

      const viewportCenterX = viewportRect.width / 2
      const viewportCenterY = viewportRect.height / 2

      const cropCenterX = crop.x + crop.width / 2
      const cropCenterY = crop.y + crop.height / 2

      const deltaX = cropCenterX - viewportCenterX
      const deltaY = cropCenterY - viewportCenterY

      const imageCenterX = naturalSize.width / 2
      const imageCenterY = naturalSize.height / 2

      const sourceX = imageCenterX + (deltaX - offset.x) / zoom
      const sourceY = imageCenterY + (deltaY - offset.y) / zoom
      const sourceWidth = crop.width / zoom
      const sourceHeight = crop.height / zoom

      ctx.drawImage(
        imageEl,
        sourceX - sourceWidth / 2,
        sourceY - sourceHeight / 2,
        sourceWidth,
        sourceHeight,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height,
      )

      ctx.restore()

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
      const fixedCropArea = !!prop("fixedCropArea")
      const cropShape = prop("cropShape")
      const crop = context.get("crop")
      const zoom = context.get("zoom")
      const rotation = context.get("rotation")
      const naturalSize = context.get("naturalSize")
      const pinchActive = context.get("pinchDistance") != null
      const isImageReady = naturalSize.width > 0 && naturalSize.height > 0
      const isDragging = state.matches("dragging")
      const isPanning = state.matches("panning")
      const rootId = dom.getRootId(scope)
      const viewportId = dom.getViewportId(scope)
      const selectionId = dom.getSelectionId(scope)
      const roundedCrop = getRoundedCrop(crop)
      const previewDescription = isImageReady
        ? translations.previewDescription({
            crop: roundedCrop,
            zoom: Number.isFinite(zoom) ? zoom : null,
            rotation: Number.isFinite(rotation) ? rotation : null,
          })
        : translations.previewLoading

      return normalize.element({
        ...parts.root.attrs,
        id: rootId,
        dir: prop("dir"),
        role: "group",
        "aria-roledescription": translations.rootRoleDescription,
        "aria-label": translations.rootLabel,
        "aria-description": previewDescription,
        "aria-live": "polite",
        "aria-controls": `${viewportId} ${selectionId}`,
        "aria-busy": isImageReady ? undefined : "true",
        "data-fixed": dataAttr(fixedCropArea),
        "data-shape": cropShape,
        "data-pinch": dataAttr(pinchActive),
        "data-dragging": dataAttr(isDragging),
        "data-panning": dataAttr(isPanning),
        style: {
          "--crop-width": toPx(crop.width),
          "--crop-height": toPx(crop.height),
          "--crop-x": toPx(crop.x),
          "--crop-y": toPx(crop.y),
        },
      })
    },

    getViewportProps() {
      const fixedCropArea = prop("fixedCropArea")
      const viewportId = dom.getViewportId(scope)

      return normalize.element({
        ...parts.viewport.attrs,
        id: viewportId,
        role: "presentation",
        "data-ownedby": dom.getRootId(scope),
        "data-disabled": dataAttr(!!fixedCropArea),
        onPointerDown(event) {
          if (event.pointerType === "mouse" && event.button !== 0) return

          if (shouldIgnoreTouchPointer(event)) return

          const target = event.target as HTMLElement | null
          const rootEl = dom.getRootEl(scope)
          if (!target || !rootEl || !contains(rootEl, target)) return

          const selectionEl = dom.getSelectionEl(scope)

          if (!fixedCropArea && contains(selectionEl, target)) return

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
      const flip = context.get("flip")
      const naturalSize = context.get("naturalSize")
      const isImageReady = naturalSize.width > 0 && naturalSize.height > 0
      const zoomValue = toFiniteDataValue(zoom)
      const rotationValue = toFiniteDataValue(rotation)
      const flipHorizontal = !!flip?.horizontal
      const flipVertical = !!flip?.vertical

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
        "data-zoom": zoomValue,
        "data-rotation": rotationValue,
        "data-flip-horizontal": dataAttr(flipHorizontal),
        "data-flip-vertical": dataAttr(flipVertical),
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
      const viewportRect = context.get("viewportRect")
      const disabled = !!prop("fixedCropArea")
      const cropShape = prop("cropShape")

      const roundedCrop = getRoundedCrop(crop)

      const hasViewportRect = viewportRect.width > 0 && viewportRect.height > 0
      const maxX = hasViewportRect ? Math.max(0, Math.round(viewportRect.width - crop.width)) : undefined
      const ariaValueMax = maxX != null ? maxX : Math.max(roundedCrop.x, 0)
      const ariaValueText = translations.selectionValueText({ shape: cropShape, ...roundedCrop })
      const selectionLabel = translations.selectionLabel({ shape: cropShape })

      return normalize.element({
        ...parts.selection.attrs,
        id: dom.getSelectionId(scope),
        tabIndex: disabled ? undefined : 0,
        role: "slider",
        "aria-label": selectionLabel,
        "aria-roledescription": translations.selectionRoleDescription,
        "aria-disabled": disabled ? "true" : undefined,
        "aria-valuemin": 0,
        "aria-valuemax": ariaValueMax,
        "aria-valuenow": roundedCrop.x,
        "aria-valuetext": ariaValueText,
        "aria-description": translations.selectionInstructions,
        "data-disabled": dataAttr(disabled),
        "data-shape": cropShape,
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
            const handlePosition = key === "ArrowUp" || key === "ArrowDown" ? "bottom" : "right"
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
      const disabled = !!prop("fixedCropArea")

      return normalize.element({
        ...parts.handle.attrs,
        id: dom.getHandleId(scope, handlePosition),
        "data-position": handlePosition,
        "aria-hidden": "true",
        role: "presentation",
        tabIndex: undefined,
        "data-disabled": dataAttr(disabled),
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
  }
}
