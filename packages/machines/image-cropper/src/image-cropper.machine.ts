import { createMachine } from "@zag-js/core"
import * as dom from "./image-cropper.dom"
import type { HandlePosition, ImageCropperSchema } from "./image-cropper.types"
import type { Point, Rect, Size } from "@zag-js/types"
import { addDomEvent, getEventPoint, getEventTarget } from "@zag-js/dom-query"
import { computeMoveCrop, computeResizeCrop } from "./image-cropper.utils"
import { clampValue } from "@zag-js/utils"

export const machine = createMachine<ImageCropperSchema>({
  props({ props }) {
    return {
      initialCrop: { x: 0, y: 0, width: 50, height: 50 },
      minCropSize: { width: 40, height: 40 },
      zoomStep: 0.1,
      minZoom: 1,
      maxZoom: 5,
      ...props,
    }
  },

  context({ bindable, prop }) {
    return {
      naturalSize: bindable<Size>(() => ({
        defaultValue: { width: 0, height: 0 },
      })),
      crop: bindable<Rect>(() => ({
        defaultValue: prop("initialCrop"),
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
      lastShiftKey: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      zoom: bindable<number>(() => ({
        defaultValue: 1,
      })),
      offset: bindable<Point>(() => ({
        defaultValue: { x: 0, y: 0 },
      })),
    }
  },

  initialState() {
    return "idle"
  },

  states: {
    idle: {
      entry: ["checkImageStatus"],
      on: {
        SET_NATURAL_SIZE: {
          actions: ["setNaturalSize"],
        },
        POINTER_DOWN: {
          guard: "hasBounds",
          target: "dragging",
          actions: ["setPointerStart", "setCropStart", "setHandlePosition"],
        },
        WHEEL: {
          guard: "hasBounds",
          actions: ["updateZoom"],
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
          actions: ["clearPointerStart", "clearCropStart", "clearHandlePosition", "clearShiftState"],
        },
        WHEEL: {
          actions: ["updateZoom"],
        },
      },
    },
  },

  implementations: {
    guards: {
      hasBounds({ scope }) {
        const bounds = dom.getViewportBounds(scope)
        return bounds.width > 0 && bounds.height > 0
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

      setNaturalSize({ event, context }) {
        context.set("naturalSize", event.size)
      },

      setPointerStart({ event, context }) {
        const point = event.point

        context.set("pointerStart", point)
      },

      setCropStart({ context }) {
        const crop = context.get("crop")
        context.set("cropStart", crop)
      },

      updateCrop({ context, event, prop, scope }) {
        const minCropSize = prop("minCropSize")
        const handlePosition = context.get("handlePosition")
        const pointerStart = context.get("pointerStart")
        const cropStart = context.get("cropStart")
        let aspectRatio = prop("aspectRatio")

        const bounds = dom.getViewportBounds(scope)

        const currentPoint = event.point

        if (!pointerStart || !cropStart) return

        const delta = { x: currentPoint.x - pointerStart.x, y: currentPoint.y - pointerStart.y }

        let nextCrop
        if (handlePosition) {
          if (aspectRatio == null || !Number.isFinite(aspectRatio) || aspectRatio <= 0) {
            const lastShiftKey = context.get("lastShiftKey")

            if (event.shiftKey && !lastShiftKey) {
              const currentCrop = context.get("crop")
              const w = currentCrop.width
              const h = currentCrop.height
              if (w > 0 && h > 0) {
                const ratio = w / h
                if (Number.isFinite(ratio) && ratio > 0) {
                  context.set("shiftLockRatio", ratio)
                }
              }
            }

            if (event.shiftKey) {
              const lock = context.get("shiftLockRatio")
              if (lock && Number.isFinite(lock) && lock > 0) {
                aspectRatio = lock
              }
            } else {
              context.set("shiftLockRatio", null)
            }
          }
          nextCrop = computeResizeCrop({
            cropStart,
            handlePosition,
            delta,
            bounds,
            minSize: minCropSize,
            aspectRatio,
          })
        } else {
          nextCrop = computeMoveCrop(cropStart, delta, bounds)
        }

        context.set("crop", nextCrop)
        // Update last observed Shift state
        context.set("lastShiftKey", !!event.shiftKey)
      },

      setHandlePosition({ event, context }) {
        const position = event.handlePosition
        if (!position) return
        context.set("handlePosition", position)
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

      clearShiftState({ context }) {
        context.set("shiftLockRatio", null)
        context.set("lastShiftKey", false)
      },

      updateZoom({ context, event, prop, scope }) {
        const delta = Number(event.deltaY)
        if (!Number.isFinite(delta) || delta === 0) return

        const stepProp = prop("zoomStep")
        const step = Math.abs(stepProp)

        let minZoom = prop("minZoom")
        let maxZoom = prop("maxZoom")

        if (minZoom > maxZoom) {
          ;[minZoom, maxZoom] = [maxZoom, minZoom]
        }

        const direction = Math.sign(delta) < 0 ? 1 : -1

        const currentZoom = context.get("zoom")
        if (!Number.isFinite(currentZoom) || currentZoom <= 0) return

        const nextZoom = clampValue(currentZoom + step * direction, minZoom, maxZoom)

        if (nextZoom === currentZoom) return

        const point = event.point

        const bounds = dom.getViewportBounds(scope)
        const naturalSize = context.get("naturalSize")

        let viewportWidth = bounds.width
        let viewportHeight = bounds.height

        const clampOffsetValue = (value: number, viewportSize: number, imageSize: number) => {
          if (!Number.isFinite(value) || !Number.isFinite(viewportSize) || viewportSize <= 0) return value
          if (!Number.isFinite(imageSize) || imageSize <= 0) return value
          const limit = viewportSize - imageSize
          const min = Math.min(0, limit)
          const max = Math.max(0, limit)
          return clampValue(value, min, max)
        }

        // Keep the translated image within the viewport for a given zoom level.
        const clampOffset = (offset: Point, zoom: number): Point => {
          if (!Number.isFinite(zoom) || zoom <= 0) return offset
          const imageWidth = naturalSize.width * zoom
          const imageHeight = naturalSize.height * zoom
          return {
            x: clampOffsetValue(offset.x, viewportWidth, imageWidth),
            y: clampOffsetValue(offset.y, viewportHeight, imageHeight),
          }
        }

        const currentOffsetRaw = context.get("offset")
        const currentOffset = clampOffset(
          {
            x: Number.isFinite(currentOffsetRaw.x) ? currentOffsetRaw.x : 0,
            y: Number.isFinite(currentOffsetRaw.y) ? currentOffsetRaw.y : 0,
          },
          currentZoom,
        )

        if (!point) {
          context.set("zoom", nextZoom)
          context.set("offset", clampOffset(currentOffset, nextZoom))
          return
        }

        const localX = (point.x - currentOffset.x) / currentZoom
        const localY = (point.y - currentOffset.y) / currentZoom

        if (!Number.isFinite(localX) || !Number.isFinite(localY)) {
          context.set("zoom", nextZoom)
          context.set("offset", clampOffset(currentOffset, nextZoom))
          return
        }

        const nextOffset = {
          x: point.x - localX * nextZoom,
          y: point.y - localY * nextZoom,
        }

        if (!Number.isFinite(nextOffset.x) || !Number.isFinite(nextOffset.y)) {
          context.set("zoom", nextZoom)
          context.set("offset", clampOffset(currentOffset, nextZoom))
          return
        }

        context.set("zoom", nextZoom)
        context.set("offset", clampOffset(nextOffset, nextZoom))
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
