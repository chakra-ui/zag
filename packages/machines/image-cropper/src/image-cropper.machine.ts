import { createMachine } from "@zag-js/core"
import { addDomEvent, getEventPoint, getEventTarget, resizeObserverBorderBox } from "@zag-js/dom-query"
import type { Point, Rect, Size } from "@zag-js/types"
import { callAll, clampValue } from "@zag-js/utils"
import * as dom from "./image-cropper.dom"
import type { BoundingRect, FlipState, HandlePosition, ImageCropperSchema } from "./image-cropper.types"
import {
  addPoints,
  centerRect,
  clampOffset,
  clampPoint,
  computeDefaultCropDimensions,
  computeKeyboardCrop,
  computeMoveCrop,
  computeResizeCrop,
  getCenterPoint,
  getCropSizeLimits,
  getKeyboardMoveDelta,
  getMaxBounds,
  getMidpoint,
  getNudgeStep,
  getTouchDistance,
  getViewportCenter,
  isEqualFlip,
  isSameSize,
  isVisibleRect,
  normalizeFlipState,
  resolveCropAspectRatio,
  scaleRect,
  scaleSize,
  subtractPoints,
  ZERO_POINT,
} from "./image-cropper.utils"

export const machine = createMachine<ImageCropperSchema>({
  props({ props }) {
    return {
      minWidth: 40,
      minHeight: 40,
      maxWidth: Number.POSITIVE_INFINITY,
      maxHeight: Number.POSITIVE_INFINITY,
      defaultZoom: 1,
      zoomStep: 0.1,
      zoomSensitivity: 2,
      minZoom: 1,
      maxZoom: 5,
      defaultRotation: 0,
      defaultFlip: { horizontal: false, vertical: false },
      fixedCropArea: false,
      cropShape: "rectangle",
      nudgeStep: 1,
      nudgeStepShift: 10,
      nudgeStepCtrl: 50,
      ...props,
      translations: {
        rootLabel: "Image cropper",
        rootRoleDescription: "Image cropper",
        previewLoading: "Image cropper preview loading",
        previewDescription({ crop, zoom, rotation }) {
          const zoomText = zoom != null && Number.isFinite(zoom) ? `${zoom.toFixed(2)}x zoom` : "default zoom"
          const rotationText =
            rotation != null && Number.isFinite(rotation)
              ? `${Math.round(rotation)} degrees rotation`
              : "0 degrees rotation"
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
        ...props.translations,
      },
    }
  },

  context({ bindable, prop }) {
    return {
      naturalSize: bindable<Size>(() => ({
        defaultValue: { width: 0, height: 0 },
      })),
      crop: bindable<Rect>(() => ({
        defaultValue: { x: 0, y: 0, width: 0, height: 0 },
        onChange(crop) {
          prop("onCropChange")?.({ crop })
        },
      })),
      pointerStart: bindable<Point | null>(() => ({
        defaultValue: null,
      })),
      cropStart: bindable<Rect | null>(() => ({
        defaultValue: null,
      })),
      handlePosition: bindable<HandlePosition | null>(() => ({
        defaultValue: null,
      })),
      shiftLockRatio: bindable<number | null>(() => ({
        defaultValue: null,
      })),
      pinchDistance: bindable<number | null>(() => ({
        defaultValue: null,
      })),
      pinchMidpoint: bindable<Point | null>(() => ({
        defaultValue: null,
      })),
      zoom: bindable<number>(() => ({
        defaultValue: prop("zoom") ?? prop("defaultZoom"),
        onChange(zoom) {
          prop("onZoomChange")?.({ zoom })
        },
      })),
      rotation: bindable<number>(() => ({
        defaultValue: prop("defaultRotation"),
        value: prop("rotation"),
        onChange(rotation) {
          prop("onRotationChange")?.({ rotation })
        },
      })),
      flip: bindable<FlipState>(() => {
        const defaultFlip = prop("defaultFlip")
        return {
          defaultValue: { ...defaultFlip },
          value: prop("flip"),
          onChange(flip) {
            prop("onFlipChange")?.({ flip })
          },
        }
      }),
      offset: bindable<Point>(() => ({
        defaultValue: ZERO_POINT,
      })),
      offsetStart: bindable<Point | null>(() => ({
        defaultValue: null,
      })),
      viewportRect: bindable<BoundingRect>(() => ({
        defaultValue: { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 },
      })),
    }
  },

  initialState() {
    return "idle"
  },

  on: {
    PINCH_START: {
      actions: ["setPinchDistance"],
    },
    PINCH_MOVE: {
      actions: ["handlePinchMove"],
    },
    PINCH_END: {
      actions: ["clearPinchDistance"],
    },
    SET_ZOOM: {
      actions: ["updateZoom"],
    },
    SET_ROTATION: {
      actions: ["setRotation"],
    },
    SET_FLIP: {
      actions: ["setFlip"],
    },
    RESIZE_CROP: {
      guard: "canResizeCrop",
      actions: ["resizeCrop"],
    },
    VIEWPORT_RESIZE: {
      actions: ["resizeViewport"],
    },
    RESET: {
      actions: ["resetToInitialState"],
    },
  },

  computed: {
    isMeasured: ({ context }) => isVisibleRect(context.get("viewportRect")) && isVisibleRect(context.get("crop")),
    isImageReady: ({ context }) => isVisibleRect(context.get("naturalSize")),
  },

  watch({ track, context, prop, send }) {
    track([() => prop("zoom")], () => {
      const propZoom = prop("zoom")
      if (propZoom === undefined) return

      const currentZoom = context.get("zoom")
      if (propZoom === currentZoom) return

      send({ type: "SET_ZOOM", zoom: propZoom, src: "prop" })
    })
  },

  states: {
    idle: {
      entry: ["checkImageStatus"],
      effects: ["trackViewportResize", "trackWheelEvent", "trackTouchEvents"],
      on: {
        SET_NATURAL_SIZE: {
          actions: ["setNaturalSize"],
        },
        SET_DEFAULT_CROP: {
          actions: ["setDefaultCrop"],
        },
        POINTER_DOWN: {
          guard: "canDragSelection",
          target: "dragging",
          actions: ["setPointerStart", "setCropStart", "setHandlePosition"],
        },
        PAN_POINTER_DOWN: {
          guard: "canPan",
          target: "panning",
          actions: ["setPointerStart", "setOffsetStart"],
        },
        ZOOM: {
          guard: "hasViewportRect",
          actions: ["updateZoom"],
        },
        NUDGE_RESIZE_CROP: {
          guard: "hasViewportRect",
          actions: ["nudgeResizeCrop"],
        },
        NUDGE_MOVE_CROP: {
          guard: "hasViewportRect",
          actions: ["nudgeMoveCrop"],
        },
      },
    },

    dragging: {
      effects: ["trackPointerMove"],
      on: {
        POINTER_MOVE: {
          actions: ["updateCrop"],
        },
        POINTER_UP: {
          target: "idle",
          actions: [
            "clearPointerStart",
            "clearCropStart",
            "clearHandlePosition",
            "clearOffsetStart",
            "clearShiftRatio",
          ],
        },
      },
    },

    panning: {
      effects: ["trackPointerMove"],
      on: {
        POINTER_MOVE: {
          actions: ["updatePanOffset"],
        },
        POINTER_UP: {
          target: "idle",
          actions: ["clearPointerStart", "clearOffsetStart"],
        },
      },
    },
  },

  implementations: {
    guards: {
      hasViewportRect({ context }) {
        return isVisibleRect(context.get("viewportRect"))
      },
      canResizeCrop({ context, prop }) {
        return !prop("fixedCropArea") && isVisibleRect(context.get("viewportRect"))
      },
      canPan({ context }) {
        return isVisibleRect(context.get("naturalSize")) && isVisibleRect(context.get("viewportRect"))
      },
      canDragSelection({ context, prop }) {
        return isVisibleRect(context.get("viewportRect")) && !prop("fixedCropArea")
      },
    },

    actions: {
      checkImageStatus({ send, scope, context }) {
        const naturalSize = context.get("naturalSize")
        const imageEl = dom.getImageEl(scope)
        if (!imageEl?.complete) return

        const { naturalWidth: width, naturalHeight: height } = imageEl

        if (isVisibleRect({ width, height }) && !isVisibleRect(naturalSize)) {
          send({ type: "SET_NATURAL_SIZE", src: "ssr", size: { width, height } })
        }
      },

      setNaturalSize({ event, context, send }) {
        context.set("naturalSize", event.size)
        send({ type: "SET_DEFAULT_CROP", src: "init" })
      },

      setDefaultCrop({ context, prop, scope }) {
        const viewportEl = dom.getViewportEl(scope)
        if (!viewportEl) return

        const viewportRect = getBoundingRect(viewportEl)
        if (!isVisibleRect(viewportRect)) return

        const cropShape = prop("cropShape")
        const aspectRatio = resolveCropAspectRatio(cropShape, prop("aspectRatio"))
        const { minSize, maxSize } = getCropSizeLimits(prop)

        const clampSize = (rect: Rect) => {
          const result = computeResizeCrop({
            cropStart: rect,
            handlePosition: "se",
            delta: ZERO_POINT,
            viewportRect,
            minSize,
            maxSize,
            aspectRatio,
          })

          return { width: result.width, height: result.height }
        }

        const initialCrop = prop("initialCrop")
        if (initialCrop) {
          const constrainedSize = clampSize({
            x: 0,
            y: 0,
            width: initialCrop.width,
            height: initialCrop.height,
          })

          const { width, height } = constrainedSize

          const max = getMaxBounds({ width, height }, viewportRect)
          const { x, y } = clampPoint(initialCrop, ZERO_POINT, max)

          context.set("crop", { x, y, width, height })
          return
        }

        const fixedCropArea = prop("fixedCropArea")
        const defaultSize = computeDefaultCropDimensions(viewportRect, aspectRatio, fixedCropArea)
        const constrainedSize = clampSize({
          x: 0,
          y: 0,
          width: defaultSize.width,
          height: defaultSize.height,
        })

        const width = constrainedSize.width
        const height = constrainedSize.height

        const { x, y } = centerRect({ width, height }, viewportRect)

        context.set("crop", { x, y, width, height })
        context.set("viewportRect", viewportRect)
      },

      setPointerStart({ event, context }) {
        const point = event.point
        if (!point) return

        context.set("pointerStart", point)
      },

      setOffsetStart({ context }) {
        const offset = context.get("offset")
        context.set("offsetStart", { ...offset })
      },

      setCropStart({ context }) {
        const crop = context.get("crop")
        context.set("cropStart", crop)
      },

      updateCrop({ context, event, prop }) {
        const handlePosition = context.get("handlePosition")
        const pointerStart = context.get("pointerStart")
        const cropStart = context.get("cropStart")
        const viewportRect = context.get("viewportRect")

        const cropShape = prop("cropShape")
        const aspectRatioProp = prop("aspectRatio")

        let aspectRatio = resolveCropAspectRatio(cropShape, aspectRatioProp)
        const { minSize, maxSize } = getCropSizeLimits(prop)

        if (!pointerStart || !cropStart) return

        const currentPoint = event.point
        const delta = subtractPoints(currentPoint, pointerStart)

        let nextCrop: Rect

        if (handlePosition) {
          const allowShiftLock = typeof aspectRatioProp === "undefined" && cropShape !== "circle"
          if (allowShiftLock) {
            if (event.shiftKey) {
              const currentCrop = context.get("crop")
              const w = currentCrop.width
              const h = currentCrop.height
              if (w > 0 && h > 0) {
                const ratio = w / h
                if (ratio > 0) context.set("shiftLockRatio", ratio)
              }

              const lockRatio = context.get("shiftLockRatio")
              if (lockRatio !== null && lockRatio > 0) aspectRatio = lockRatio
            } else {
              context.set("shiftLockRatio", null)
            }
          } else {
            context.set("shiftLockRatio", null)
          }
          nextCrop = computeResizeCrop({
            cropStart,
            handlePosition,
            delta,
            viewportRect,
            minSize,
            maxSize,
            aspectRatio,
          })
        } else {
          nextCrop = computeMoveCrop(cropStart, delta, viewportRect)
        }

        context.set("crop", nextCrop)
      },

      updatePanOffset({ context, event, prop }) {
        const point = event.point
        const pointerStart = context.get("pointerStart")
        const offsetStart = context.get("offsetStart")

        if (!point || !pointerStart || !offsetStart) return

        const zoom = context.get("zoom")
        const rotation = context.get("rotation")
        const viewportRect = context.get("viewportRect")

        const delta = subtractPoints(point, pointerStart)

        const nextOffset = clampOffset({
          zoom,
          rotation,
          viewportSize: viewportRect,
          offset: addPoints(offsetStart, delta),
          fixedCropArea: prop("fixedCropArea"),
          crop: context.get("crop"),
          naturalSize: context.get("naturalSize"),
        })

        context.set("offset", nextOffset)
      },

      setHandlePosition({ event, context }) {
        const position = event.handlePosition
        if (!position) return
        context.set("handlePosition", position)
      },

      setRotation({ context, event }) {
        const rotation = event.rotation
        const nextRotation = clampValue(rotation, 0, 360)
        context.set("rotation", nextRotation)
      },

      setFlip({ context, event }) {
        const nextFlip = event.flip as Partial<FlipState> | undefined
        if (!nextFlip) return
        const currentFlip = context.get("flip")
        const normalized = normalizeFlipState(nextFlip, currentFlip)
        if (isEqualFlip(normalized, currentFlip)) return
        context.set("flip", normalized)
      },

      resizeCrop({ context, event, prop }) {
        const { handlePosition, delta } = event
        if (!handlePosition) return

        const viewportRect = context.get("viewportRect")
        if (!isVisibleRect(viewportRect)) return

        const cropShape = prop("cropShape")
        const aspectRatio = resolveCropAspectRatio(cropShape, prop("aspectRatio"))
        const { minSize, maxSize } = getCropSizeLimits(prop)

        const crop = context.get("crop")
        const nextCrop = computeResizeCrop({
          cropStart: crop,
          handlePosition,
          delta,
          viewportRect,
          minSize,
          maxSize,
          aspectRatio,
        })

        context.set("crop", nextCrop)
      },

      clearPointerStart({ context }) {
        context.set("pointerStart", null)
      },

      clearCropStart({ context }) {
        context.set("cropStart", null)
      },

      clearHandlePosition({ context }) {
        context.set("handlePosition", null)
      },

      clearOffsetStart({ context }) {
        context.set("offsetStart", null)
      },

      clearShiftRatio({ context }) {
        context.set("shiftLockRatio", null)
      },

      updateZoom({ context, event, prop }) {
        let { delta, point, zoom: targetZoom, scale, panDelta } = event

        const crop = context.get("crop")
        const currentZoom = context.get("zoom")
        const currentOffset = context.get("offset")
        const rotation = context.get("rotation")
        const viewportRect = context.get("viewportRect")
        const naturalSize = context.get("naturalSize")
        const fixedCropArea = prop("fixedCropArea")

        // If no point is specified, zoom based on the center of the crop area
        if (!point) {
          point = getCenterPoint(crop)
        }

        const step = Math.abs(prop("zoomStep"))
        const sensitivity = Math.max(0, prop("zoomSensitivity"))
        const [minZoom, maxZoom] = [prop("minZoom"), prop("maxZoom")]

        const calculateNextZoom = (): number | null => {
          if (typeof targetZoom === "number") {
            return clampValue(targetZoom, minZoom, maxZoom)
          }

          if (event.trigger === "touch" && typeof scale === "number") {
            const minScale = 0.5
            const maxScale = 2
            const clampedScale = clampValue(scale, minScale, maxScale)
            const smoothing = sensitivity > 0 ? Math.pow(clampedScale, sensitivity) : clampedScale
            return clampValue(currentZoom * smoothing, minZoom, maxZoom)
          }

          if (typeof delta === "number") {
            const direction = Math.sign(delta) < 0 ? 1 : -1
            return clampValue(currentZoom + step * direction, minZoom, maxZoom)
          }

          return null
        }

        const applyClampedOffset = (zoom: number, offset: Point): Point => {
          return clampOffset({
            zoom,
            rotation,
            viewportSize: viewportRect,
            offset,
            fixedCropArea,
            crop,
            naturalSize,
          })
        }

        const nextZoom = calculateNextZoom()
        if (nextZoom === null) return

        // Handle pan-only update
        if (nextZoom === currentZoom && panDelta) {
          const nextOffset = applyClampedOffset(currentZoom, addPoints(currentOffset, panDelta))
          context.set("offset", nextOffset)
          return
        }

        if (nextZoom === currentZoom) return

        const { width: viewportWidth, height: viewportHeight } = viewportRect
        const { x: centerX, y: centerY } = getViewportCenter(viewportRect)

        const zoomRatio = nextZoom / currentZoom
        let nextOffset: Point = {
          x: (1 - zoomRatio) * (point.x - centerX) + zoomRatio * currentOffset.x,
          y: (1 - zoomRatio) * (point.y - centerY) + zoomRatio * currentOffset.y,
        }

        // Apply pan delta from pinch movement if provided
        if (panDelta) {
          nextOffset = applyClampedOffset(nextZoom, addPoints(nextOffset, panDelta))
        } else if (nextZoom < currentZoom) {
          // Handle zoom out - clamp offset to keep image within bounds
          if (fixedCropArea) {
            nextOffset = applyClampedOffset(nextZoom, nextOffset)
          } else {
            // Manual clamping for non-fixed crop area
            const { width: scaledImageWidth, height: scaledImageHeight } = scaleSize(viewportRect, nextZoom)

            if (scaledImageWidth <= viewportWidth) {
              nextOffset.x = 0
            } else {
              const minX = viewportWidth - centerX - scaledImageWidth / 2
              const maxX = scaledImageWidth / 2 - centerX
              nextOffset.x = Math.max(minX, Math.min(maxX, nextOffset.x))
            }

            if (scaledImageHeight <= viewportHeight) {
              nextOffset.y = 0
            } else {
              const minY = viewportHeight - centerY - scaledImageHeight / 2
              const maxY = scaledImageHeight / 2 - centerY
              nextOffset.y = Math.max(minY, Math.min(maxY, nextOffset.y))
            }
          }
        }

        context.set("zoom", nextZoom)
        context.set("offset", nextOffset)
      },

      setPinchDistance({ context, event, send }) {
        const touches = Array.isArray(event.touches) ? event.touches : []
        if (touches.length < 2) return
        if (context.get("pointerStart") !== null) {
          send({ type: "POINTER_UP", src: "pinch" })
        }
        const [first, second] = touches
        const distance = getTouchDistance(first, second)

        const viewportRect = context.get("viewportRect")
        const midpoint = getMidpoint(first, second, { x: viewportRect.left, y: viewportRect.top })

        context.set("pinchDistance", distance)
        context.set("pinchMidpoint", midpoint)
      },

      handlePinchMove({ context, event, send }) {
        const touches = Array.isArray(event.touches) ? event.touches : []
        if (touches.length < 2) return

        const [first, second] = touches
        const distance = getTouchDistance(first, second)

        const lastDistance = context.get("pinchDistance")
        const lastMidpoint = context.get("pinchMidpoint")
        const viewportRect = context.get("viewportRect")

        const midpoint = getMidpoint(first, second, { x: viewportRect.left, y: viewportRect.top })

        if (lastDistance != null && lastDistance > 0 && lastMidpoint != null) {
          const delta = lastDistance - distance
          const scale = distance / lastDistance
          const distanceChange = Math.abs(delta)

          // Improve smoothing by ignoring very small changes
          const hasSignificantZoom = distanceChange > 1

          const panDelta = subtractPoints(midpoint, lastMidpoint)

          send({
            type: "ZOOM",
            trigger: "touch",
            delta,
            scale: hasSignificantZoom ? scale : 1,
            point: midpoint,
            panDelta,
          })
        }

        context.set("pinchDistance", distance)
        context.set("pinchMidpoint", midpoint)
      },

      clearPinchDistance({ context }) {
        context.set("pinchDistance", null)
        context.set("pinchMidpoint", null)
      },

      nudgeResizeCrop({ context, event, prop }) {
        const { key, handlePosition, shiftKey, ctrlKey, metaKey } = event
        const crop = context.get("crop")
        const viewportRect = context.get("viewportRect")

        const step = getNudgeStep(prop, { shiftKey, ctrlKey, metaKey })
        const { minSize, maxSize } = getCropSizeLimits(prop)

        const nextCrop = computeKeyboardCrop(key, handlePosition, step, crop, viewportRect, minSize, maxSize)

        context.set("crop", nextCrop)
      },

      nudgeMoveCrop({ context, event, prop }) {
        const { key, shiftKey, ctrlKey, metaKey } = event
        const crop = context.get("crop")
        const viewportRect = context.get("viewportRect")

        const step = getNudgeStep(prop, { shiftKey, ctrlKey, metaKey })

        const delta = getKeyboardMoveDelta(key, step)
        const nextCrop = computeMoveCrop(crop, delta, viewportRect)

        context.set("crop", nextCrop)
      },

      resizeViewport({ context, prop, scope, send }) {
        const viewportEl = dom.getViewportEl(scope)
        if (!viewportEl) return

        const newViewportRect = getBoundingRect(viewportEl)
        if (!isVisibleRect(newViewportRect)) return

        const oldViewportRect = context.get("viewportRect")

        if (isSameSize(oldViewportRect, newViewportRect)) {
          return
        }

        context.set("viewportRect", newViewportRect)

        const oldCrop = context.get("crop")

        if (!isVisibleRect(oldViewportRect)) {
          if (!isVisibleRect(oldCrop)) {
            send({ type: "SET_DEFAULT_CROP", src: "viewport-resize" })
            return
          }
        }

        const cropShape = prop("cropShape")
        const aspectRatio = resolveCropAspectRatio(cropShape, prop("aspectRatio"))
        const { minSize, maxSize } = getCropSizeLimits(prop)

        const scale = {
          x: newViewportRect.width / oldViewportRect.width,
          y: newViewportRect.height / oldViewportRect.height,
        }

        let newCrop = scaleRect(oldCrop, scale)

        const constrainedCrop = computeResizeCrop({
          cropStart: newCrop,
          handlePosition: "se",
          delta: ZERO_POINT,
          viewportRect: newViewportRect,
          minSize,
          maxSize,
          aspectRatio,
        })

        const max = getMaxBounds(constrainedCrop, newViewportRect)
        const { x, y } = clampPoint(constrainedCrop, ZERO_POINT, max)

        context.set("crop", {
          x,
          y,
          width: constrainedCrop.width,
          height: constrainedCrop.height,
        })
      },

      resetToInitialState({ context }) {
        context.set("zoom", context.initial("zoom"))
        context.set("rotation", context.initial("rotation"))
        context.set("flip", context.initial("flip"))
        context.set("offset", ZERO_POINT)
        context.set("crop", context.initial("crop"))
      },
    },

    effects: {
      trackPointerMove({ scope, send }) {
        function onPointerMove(event: PointerEvent) {
          const point = getEventPoint(event)
          const target = getEventTarget<Element>(event)
          send({ type: "POINTER_MOVE", point, target, shiftKey: event.shiftKey })
        }

        function onPointerUp() {
          send({ type: "POINTER_UP" })
        }

        return callAll(
          addDomEvent(scope.getDoc(), "pointermove", onPointerMove),
          addDomEvent(scope.getDoc(), "pointerup", onPointerUp),
        )
      },

      trackViewportResize({ scope, send }) {
        const viewportEl = dom.getViewportEl(scope)
        if (!viewportEl) return
        return resizeObserverBorderBox.observe(viewportEl, () => {
          send({ type: "VIEWPORT_RESIZE", src: "resize" })
        })
      },

      trackWheelEvent({ scope, send }) {
        const viewportEl = dom.getViewportEl(scope)
        if (!viewportEl) return

        function onWheel(event: WheelEvent) {
          event.preventDefault()

          if (!viewportEl) return

          const rect = viewportEl.getBoundingClientRect()
          const point = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          }

          send({ type: "ZOOM", trigger: "wheel", delta: event.deltaY, point })
        }

        return addDomEvent(viewportEl, "wheel", onWheel, { passive: false })
      },

      trackTouchEvents({ scope, send }) {
        const viewportEl = dom.getViewportEl(scope)
        if (!viewportEl) return

        function onTouchStart(event: TouchEvent) {
          if (event.touches.length >= 2) {
            event.preventDefault()

            const touches = Array.from(event.touches).map((touch) => ({
              x: touch.clientX,
              y: touch.clientY,
            }))

            send({ type: "PINCH_START", touches })
          }
        }

        function onTouchMove(event: TouchEvent) {
          if (event.touches.length >= 2) {
            event.preventDefault()

            const touches = Array.from(event.touches).map((touch) => ({
              x: touch.clientX,
              y: touch.clientY,
            }))

            send({ type: "PINCH_MOVE", touches })
          }
        }

        function onTouchEnd(event: TouchEvent) {
          if (event.touches.length < 2) {
            send({ type: "PINCH_END" })
          }
        }

        return callAll(
          addDomEvent(viewportEl, "touchstart", onTouchStart, { passive: false }),
          addDomEvent(viewportEl, "touchmove", onTouchMove, { passive: false }),
          addDomEvent(viewportEl, "touchend", onTouchEnd),
        )
      },
    },
  },
})

const getBoundingRect = (el: Element): BoundingRect => {
  const rect = el.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
  }
}
