import { createMachine } from "@zag-js/core"
import * as dom from "./image-cropper.dom"
import type { FlipState, HandlePosition, ImageCropperSchema } from "./image-cropper.types"
import type { Point, Rect, Size } from "@zag-js/types"
import { addDomEvent, getEventPoint, getEventTarget } from "@zag-js/dom-query"
import {
  clampOffset,
  computeDefaultCropDimensions,
  computeKeyboardCrop,
  computeMoveCrop,
  computeResizeCrop,
  getCropSizeLimits,
  getKeyboardMoveDelta,
  getNudgeStep,
  resolveCropAspectRatio,
} from "./image-cropper.utils"
import { clampValue } from "@zag-js/utils"

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
        defaultValue: prop("defaultZoom"),
        value: prop("zoom"),
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
        defaultValue: { x: 0, y: 0 },
      })),
      offsetStart: bindable<Point | null>(() => ({
        defaultValue: null,
      })),
      viewportRect: bindable<{
        width: number
        height: number
        top: number
        left: number
        right: number
        bottom: number
      }>(() => ({
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
  },

  states: {
    idle: {
      entry: ["checkImageStatus"],
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
        const viewportRect = context.get("viewportRect")
        return viewportRect.width > 0 && viewportRect.height > 0
      },
      canResizeCrop({ context, prop }) {
        if (prop("fixedCropArea")) return false
        const viewportRect = context.get("viewportRect")
        return viewportRect.width > 0 && viewportRect.height > 0
      },
      canPan({ context }) {
        const naturalSize = context.get("naturalSize")
        if (naturalSize.width <= 0 || naturalSize.height <= 0) return false
        const viewportRect = context.get("viewportRect")
        return viewportRect.width > 0 && viewportRect.height > 0
      },
      canDragSelection({ context, prop }) {
        const viewportRect = context.get("viewportRect")
        const hasViewportRect = viewportRect.width > 0 && viewportRect.height > 0
        const isNotFixed = !prop("fixedCropArea")
        return hasViewportRect && isNotFixed
      },
    },

    actions: {
      checkImageStatus({ send, scope, context }) {
        const naturalSize = context.get("naturalSize")
        const imageEl = dom.getImageEl(scope)
        if (!imageEl?.complete) return

        const { naturalWidth: width, naturalHeight: height } = imageEl

        if (width !== 0 && height !== 0 && naturalSize.width === 0 && naturalSize.height === 0) {
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
        const viewportRect = viewportEl.getBoundingClientRect()
        if (viewportRect.height <= 0 || viewportRect.width <= 0) return

        const cropShape = prop("cropShape")
        const aspectRatio = resolveCropAspectRatio(cropShape, prop("aspectRatio"))
        const { minSize, maxSize } = getCropSizeLimits(prop)

        const clampSize = (rect: Rect) => {
          const result = computeResizeCrop({
            cropStart: rect,
            handlePosition: "bottom-right",
            delta: { x: 0, y: 0 },
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
          const maxX = Math.max(0, viewportRect.width - width)
          const maxY = Math.max(0, viewportRect.height - height)
          const x = clampValue(initialCrop.x, 0, maxX)
          const y = clampValue(initialCrop.y, 0, maxY)

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

        const x = Math.max(0, (viewportRect.width - width) / 2)
        const y = Math.max(0, (viewportRect.height - height) / 2)

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
        context.set("offsetStart", { x: offset.x, y: offset.y })
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
        const requestedAspectRatio = prop("aspectRatio")
        let aspectRatio = resolveCropAspectRatio(cropShape, requestedAspectRatio)
        const { minSize, maxSize } = getCropSizeLimits(prop)

        const currentPoint = event.point

        if (!pointerStart || !cropStart) return

        const delta = { x: currentPoint.x - pointerStart.x, y: currentPoint.y - pointerStart.y }

        let nextCrop
        if (handlePosition) {
          const allowShiftLock = typeof requestedAspectRatio === "undefined" && cropShape !== "circle"
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

        const deltaX = point.x - pointerStart.x
        const deltaY = point.y - pointerStart.y

        const nextOffset = clampOffset({
          zoom,
          rotation,
          viewportRect,
          offset: {
            x: offsetStart.x + deltaX,
            y: offsetStart.y + deltaY,
          },
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
        const normalized: FlipState = {
          horizontal: typeof nextFlip.horizontal === "boolean" ? nextFlip.horizontal : currentFlip.horizontal,
          vertical: typeof nextFlip.vertical === "boolean" ? nextFlip.vertical : currentFlip.vertical,
        }
        if (normalized.horizontal === currentFlip.horizontal && normalized.vertical === currentFlip.vertical) return
        context.set("flip", normalized)
      },
      resizeCrop({ context, event, prop }) {
        const { handlePosition, delta } = event
        if (!handlePosition) return

        const viewportRect = context.get("viewportRect")
        if (viewportRect.width <= 0 || viewportRect.height <= 0) return

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

        // If no point is specified, zoom based on the center of the crop area
        if (!point) {
          const crop = context.get("crop")
          point = { x: crop.x + crop.width / 2, y: crop.y + crop.height / 2 }
        }

        const step = Math.abs(prop("zoomStep"))
        const sensitivity = Math.max(0, prop("zoomSensitivity"))
        const [minZoom, maxZoom] = [prop("minZoom"), prop("maxZoom")]
        const currentZoom = context.get("zoom")
        const viewportRect = context.get("viewportRect")

        let nextZoom

        if (typeof targetZoom === "number") {
          nextZoom = clampValue(targetZoom, minZoom, maxZoom)
        } else if (event.trigger === "touch" && typeof scale === "number") {
          const minScale = 0.5
          const maxScale = 2
          const clampedScale = clampValue(scale, minScale, maxScale)
          const smoothing = sensitivity > 0 ? Math.pow(clampedScale, sensitivity) : clampedScale
          nextZoom = clampValue(currentZoom * smoothing, minZoom, maxZoom)
        } else if (typeof delta === "number") {
          const direction = Math.sign(delta) < 0 ? 1 : -1
          nextZoom = clampValue(currentZoom + step * direction, minZoom, maxZoom)
        } else {
          return
        }

        // Only pan if there's a pan delta from pinch movement
        if (nextZoom === currentZoom && panDelta) {
          const currentOffset = context.get("offset")
          const rotation = context.get("rotation")

          const nextOffset = clampOffset({
            zoom: currentZoom,
            rotation,
            viewportRect: viewportRect,
            offset: {
              x: currentOffset.x + panDelta.x,
              y: currentOffset.y + panDelta.y,
            },
            fixedCropArea: prop("fixedCropArea"),
            crop: context.get("crop"),
            naturalSize: context.get("naturalSize"),
          })

          context.set("offset", nextOffset)
          return
        }

        if (nextZoom === currentZoom) return

        const { width: vpW, height: vpH } = viewportRect
        const centerX = vpW / 2
        const centerY = vpH / 2

        const currentOffset = context.get("offset")

        const ratio = nextZoom / currentZoom
        let nextOffset = {
          x: (1 - ratio) * (point.x - centerX) + ratio * currentOffset.x,
          y: (1 - ratio) * (point.y - centerY) + ratio * currentOffset.y,
        }

        // Apply pan delta from pinch movement if provided
        if (panDelta) {
          nextOffset.x += panDelta.x
          nextOffset.y += panDelta.y

          const rotation = context.get("rotation")
          nextOffset = clampOffset({
            zoom: nextZoom,
            rotation,
            viewportRect: viewportRect,
            offset: nextOffset,
            fixedCropArea: prop("fixedCropArea"),
            crop: context.get("crop"),
            naturalSize: context.get("naturalSize"),
          })
        } else if (nextZoom < currentZoom) {
          if (prop("fixedCropArea")) {
            const rotation = context.get("rotation")
            nextOffset = clampOffset({
              zoom: nextZoom,
              rotation,
              viewportRect: viewportRect,
              offset: nextOffset,
              fixedCropArea: true,
              crop: context.get("crop"),
              naturalSize: context.get("naturalSize"),
            })
          } else {
            const imgSize = context.get("naturalSize")
            const scaledW = imgSize.width * nextZoom
            const scaledH = imgSize.height * nextZoom

            if (scaledW <= vpW) {
              nextOffset.x = 0
            } else {
              const minX = vpW - centerX - scaledW / 2
              const maxX = scaledW / 2 - centerX
              nextOffset.x = Math.max(minX, Math.min(maxX, nextOffset.x))
            }

            if (scaledH <= vpH) {
              nextOffset.y = 0
            } else {
              const minY = vpH - centerY - scaledH / 2
              const maxY = scaledH / 2 - centerY
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
        const dx = first.x - second.x
        const dy = first.y - second.y
        const distance = Math.hypot(dx, dy)

        const viewportRect = context.get("viewportRect")
        const midpoint = {
          x: (first.x + second.x) / 2 - viewportRect.left,
          y: (first.y + second.y) / 2 - viewportRect.top,
        }

        context.set("pinchDistance", distance)
        context.set("pinchMidpoint", midpoint)
      },

      handlePinchMove({ context, event, send }) {
        const touches = Array.isArray(event.touches) ? event.touches : []
        if (touches.length < 2) return

        const [first, second] = touches
        const dx = first.x - second.x
        const dy = first.y - second.y
        const distance = Math.hypot(dx, dy)

        const lastDistance = context.get("pinchDistance")
        const lastMidpoint = context.get("pinchMidpoint")
        const viewportRect = context.get("viewportRect")

        const midpoint = {
          x: (first.x + second.x) / 2 - viewportRect.left,
          y: (first.y + second.y) / 2 - viewportRect.top,
        }

        if (lastDistance != null && lastDistance > 0 && lastMidpoint != null) {
          const delta = lastDistance - distance
          const scale = distance / lastDistance
          const distanceChange = Math.abs(delta)

          // Improve smoothing by ignoring very small changes
          const hasSignificantZoom = distanceChange > 1

          const panDelta = {
            x: midpoint.x - lastMidpoint.x,
            y: midpoint.y - lastMidpoint.y,
          }

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

        const cleanups = [
          addDomEvent(scope.getDoc(), "pointermove", onPointerMove),
          addDomEvent(scope.getDoc(), "pointerup", onPointerUp),
        ]

        return () => {
          cleanups.forEach((cleanup) => cleanup())
        }
      },
    },
  },
})
