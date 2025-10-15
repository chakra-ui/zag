import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./image-cropper.anatomy"
import * as dom from "./image-cropper.dom"
import type { ImageCropperApi, ImageCropperService } from "./image-cropper.types"
import { getEventPoint, contains, getEventKey, dataAttr } from "@zag-js/dom-query"
import { toPx } from "@zag-js/utils"

export function connect<T extends PropTypes>(
  service: ImageCropperService,
  normalize: NormalizeProps<T>,
): ImageCropperApi<T> {
  const { scope, send, context, prop, state } = service

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
      const zoomValue = Number.isFinite(zoom) ? String(zoom) : undefined
      const rotationValue = Number.isFinite(rotation) ? String(rotation) : undefined
      const rootId = dom.getRootId(scope)
      const viewportId = dom.getViewportId(scope)
      const selectionId = dom.getSelectionId(scope)

      return normalize.element({
        ...parts.root.attrs,
        id: rootId,
        dir: prop("dir"),
        role: "group",
        "aria-roledescription": "Image cropper",
        "aria-label": "Image cropper",
        "aria-controls": `${viewportId} ${selectionId}`,
        "aria-busy": isImageReady ? undefined : "true",
        "data-ready": dataAttr(isImageReady),
        "data-fixed": dataAttr(fixedCropArea),
        "data-shape": cropShape,
        "data-pinch": dataAttr(pinchActive),
        "data-dragging": dataAttr(isDragging),
        "data-panning": dataAttr(isPanning),
        "data-zoom": zoomValue,
        "data-rotation": rotationValue,
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
      const crop = context.get("crop")
      const zoom = context.get("zoom")
      const rotation = context.get("rotation")
      const naturalSize = context.get("naturalSize")
      const isImageReady = naturalSize.width > 0 && naturalSize.height > 0
      const roundedX = Math.round(crop.x)
      const roundedY = Math.round(crop.y)
      const roundedWidth = Math.round(crop.width)
      const roundedHeight = Math.round(crop.height)
      const zoomLabel = Number.isFinite(zoom) ? `${zoom.toFixed(2)}x zoom` : "default zoom"
      const rotationLabel = Number.isFinite(rotation)
        ? `${Math.round(rotation)} degrees rotation`
        : "0 degrees rotation"
      const viewportLabel = isImageReady
        ? `Image cropper preview, ${zoomLabel}, ${rotationLabel}. Crop positioned at ${roundedX}px from the left and ${roundedY}px from the top with a size of ${roundedWidth}px by ${roundedHeight}px.`
        : "Image cropper preview loading"
      const zoomValue = Number.isFinite(zoom) ? String(zoom) : undefined
      const rotationValue = Number.isFinite(rotation) ? String(rotation) : undefined
      const viewportId = dom.getViewportId(scope)

      return normalize.element({
        ...parts.viewport.attrs,
        id: viewportId,
        role: "img",
        "aria-roledescription": "Crop preview",
        "aria-label": viewportLabel,
        "aria-busy": isImageReady ? undefined : "true",
        "aria-live": "polite",
        "aria-controls": dom.getImageId(scope),
        "data-ownedby": dom.getRootId(scope),
        "data-ready": dataAttr(isImageReady),
        "data-disabled": dataAttr(!!fixedCropArea),
        "data-zoom": zoomValue,
        "data-rotation": rotationValue,
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
      const naturalSize = context.get("naturalSize")
      const isImageReady = naturalSize.width > 0 && naturalSize.height > 0
      const zoomValue = Number.isFinite(zoom) ? String(zoom) : undefined
      const rotationValue = Number.isFinite(rotation) ? String(rotation) : undefined

      const translate = `translate(${toPx(offset.x)}, ${toPx(offset.y)})`
      const rotate = `rotate(${rotation}deg)`
      const scale = `scale(${zoom})`

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

      const roundedX = Math.round(crop.x)
      const roundedY = Math.round(crop.y)
      const roundedWidth = Math.round(crop.width)
      const roundedHeight = Math.round(crop.height)

      const hasViewportRect = viewportRect.width > 0 && viewportRect.height > 0
      const maxX = hasViewportRect ? Math.max(0, Math.round(viewportRect.width - crop.width)) : undefined
      const ariaValueMax = maxX != null ? maxX : Math.max(roundedX, 0)

      const shapeLabel = cropShape === "circle" ? "circle" : "rectangle"
      const ariaValueText =
        cropShape === "circle"
          ? `Position X ${roundedX}px, Y ${roundedY}px. Diameter ${roundedWidth}px.`
          : `Position X ${roundedX}px, Y ${roundedY}px. Size ${roundedWidth}px by ${roundedHeight}px.`

      return normalize.element({
        ...parts.selection.attrs,
        id: dom.getSelectionId(scope),
        tabIndex: disabled ? undefined : 0,
        role: "slider",
        "aria-label": `Crop selection area (${shapeLabel})`,
        "aria-roledescription": "2d slider",
        "aria-disabled": disabled ? "true" : undefined,
        "aria-valuemin": 0,
        "aria-valuemax": ariaValueMax,
        "aria-valuenow": roundedX,
        "aria-valuetext": ariaValueText,
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
          const { shiftKey, ctrlKey, metaKey } = event
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

          const key = getEventKey(event, { dir: prop("dir") })
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
      const crop = context.get("crop")
      const viewportRect = context.get("viewportRect")
      const disabled = !!prop("fixedCropArea")

      const hasLeft = handlePosition.includes("left")
      const hasRight = handlePosition.includes("right")
      const hasTop = handlePosition.includes("top")
      const hasBottom = handlePosition.includes("bottom")
      const isCorner = (hasLeft || hasRight) && (hasTop || hasBottom)
      const isHorizontalHandle = !isCorner && (hasLeft || hasRight)
      const isVerticalHandle = !isCorner && (hasTop || hasBottom)

      const minWidthProp = Math.max(0, prop("minWidth") ?? 0)
      const minHeightProp = Math.max(0, prop("minHeight") ?? 0)
      const maxWidthProp = prop("maxWidth")
      const maxHeightProp = prop("maxHeight")

      const viewportWidth = viewportRect.width > 0 ? viewportRect.width : undefined
      const viewportHeight = viewportRect.height > 0 ? viewportRect.height : undefined

      const minWidth = viewportWidth ? Math.min(minWidthProp, viewportWidth) : minWidthProp
      const minHeight = viewportHeight ? Math.min(minHeightProp, viewportHeight) : minHeightProp

      const resolvedMaxWidth = (() => {
        if (viewportWidth) {
          if (Number.isFinite(maxWidthProp)) return Math.min(maxWidthProp, viewportWidth)
          return viewportWidth
        }
        if (Number.isFinite(maxWidthProp)) return maxWidthProp
        return Math.max(minWidth, crop.width)
      })()

      const resolvedMaxHeight = (() => {
        if (viewportHeight) {
          if (Number.isFinite(maxHeightProp)) return Math.min(maxHeightProp, viewportHeight)
          return viewportHeight
        }
        if (Number.isFinite(maxHeightProp)) return maxHeightProp
        return Math.max(minHeight, crop.height)
      })()

      const maxWidth = Math.max(minWidth, resolvedMaxWidth)
      const maxHeight = Math.max(minHeight, resolvedMaxHeight)

      const roundedWidth = Math.round(crop.width)
      const roundedHeight = Math.round(crop.height)

      const selectionId = dom.getSelectionId(scope)

      const aria: {
        orientation?: "horizontal" | "vertical"
        valueNow?: number
        valueMin?: number
        valueMax?: number
        valueText?: string
        roleDescription?: string
      } = {}

      if (isCorner) {
        aria.valueNow = roundedWidth
        aria.valueMin = Math.round(minWidth)
        aria.valueMax = Math.round(maxWidth)
        aria.valueText = `Width ${roundedWidth}px, Height ${roundedHeight}px`
        aria.roleDescription = "2d slider"
      } else if (isHorizontalHandle) {
        aria.orientation = "horizontal"
        aria.valueNow = roundedWidth
        aria.valueMin = Math.round(minWidth)
        aria.valueMax = Math.round(maxWidth)
        aria.valueText = `Width ${roundedWidth}px`
      } else if (isVerticalHandle) {
        aria.orientation = "vertical"
        aria.valueNow = roundedHeight
        aria.valueMin = Math.round(minHeight)
        aria.valueMax = Math.round(maxHeight)
        aria.valueText = `Height ${roundedHeight}px`
      }

      return normalize.element({
        ...parts.handle.attrs,
        id: dom.getHandleId(scope, handlePosition),
        "data-position": handlePosition,
        tabIndex: disabled ? undefined : 0,
        role: "slider",
        "aria-label": `Resize handle for ${handlePosition} ${isCorner ? "corner" : "edge"}`,
        "aria-controls": selectionId,
        "aria-disabled": disabled ? "true" : undefined,
        "aria-roledescription": aria.roleDescription,
        "aria-orientation": aria.orientation,
        "aria-valuemin": aria.valueMin,
        "aria-valuemax": aria.valueMax,
        "aria-valuenow": aria.valueNow,
        "aria-valuetext": aria.valueText,
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
        onKeyDown(event) {
          if (disabled) {
            event.preventDefault()
            return
          }
          if (event.defaultPrevented) return
          const src = "handle"
          const { shiftKey, ctrlKey, metaKey } = event
          const keyMap: EventKeyMap = {
            ArrowUp() {
              send({ type: "NUDGE_RESIZE_CROP", handlePosition, key: "ArrowUp", src, shiftKey, ctrlKey, metaKey })
            },
            ArrowDown() {
              send({ type: "NUDGE_RESIZE_CROP", handlePosition, key: "ArrowDown", src, shiftKey, ctrlKey, metaKey })
            },
            ArrowLeft() {
              send({ type: "NUDGE_RESIZE_CROP", handlePosition, key: "ArrowLeft", src, shiftKey, ctrlKey, metaKey })
            },
            ArrowRight() {
              send({ type: "NUDGE_RESIZE_CROP", handlePosition, key: "ArrowRight", src, shiftKey, ctrlKey, metaKey })
            },
          }

          const key = getEventKey(event, { dir: prop("dir") })
          const exec = keyMap[key]

          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
      })
    },
  }
}
