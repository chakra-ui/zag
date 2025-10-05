import { createMachine } from "@zag-js/core"
import * as dom from "./image-cropper.dom"
import type { HandlePosition, ImageCropperSchema } from "./image-cropper.types"
import type { Point, Rect, Size } from "@zag-js/types"
import { addDomEvent, getEventPoint, getEventTarget } from "@zag-js/dom-query"
import { clampImageOffset, computeMoveCrop, computeResizeCrop, normalizePoint } from "./image-cropper.utils"
import { clampValue } from "@zag-js/utils"

export const machine = createMachine<ImageCropperSchema>({
  props({ props }) {
    return {
      initialCrop: { x: 0, y: 0, width: 50, height: 50 },
      minCropSize: { width: 40, height: 40 },
      defaultZoom: 1,
      zoomStep: 0.25,
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
      pinchDistance: bindable<number | null>(() => ({
        defaultValue: null,
      })),
      zoom: bindable<number>(() => ({
        defaultValue: prop("defaultZoom"),
        value: prop("zoom"),
        onChange(zoom) {
          prop("onZoomChange")?.({ zoom })
        },
      })),
      offset: bindable<Point>(() => ({
        defaultValue: { x: 0, y: 0 },
      })),
      offsetStart: bindable<Point | null>(() => ({
        defaultValue: null,
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
      actions: ["setZoom"],
    },
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
        PAN_POINTER_DOWN: {
          guard: "canPan",
          target: "panning",
          actions: ["setPointerStart", "setOffsetStart", "clearHandlePosition", "clearCropStart", "clearShiftState"],
        },
        ZOOM: {
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
          actions: [
            "clearPointerStart",
            "clearCropStart",
            "clearHandlePosition",
            "clearOffsetStart",
            "clearShiftState",
          ],
        },
      },
    },

    panning: {
      effects: ["trackPointerMove"],
      on: {
        POINTER_MOVE: {
          actions: ["updateOffsetFromPointer"],
        },
        POINTER_UP: {
          target: "idle",
          actions: [
            "clearPointerStart",
            "clearOffsetStart",
            "clearHandlePosition",
            "clearCropStart",
            "clearShiftState",
          ],
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
      canPan({ context, scope }) {
        const zoom = context.get("zoom")
        if (!Number.isFinite(zoom) || zoom <= 1) return false
        const naturalSize = context.get("naturalSize")
        if (naturalSize.width <= 0 || naturalSize.height <= 0) return false
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
        if (!point) return

        context.set("pointerStart", normalizePoint(point))
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

      setOffsetStart({ context, scope }) {
        const offset = context.get("offset")
        const zoom = context.get("zoom")
        const naturalSize = context.get("naturalSize")
        const bounds = dom.getViewportBounds(scope)
        const viewport = { width: bounds.width, height: bounds.height }

        context.set("offsetStart", clampImageOffset({ offset, zoom, viewport, naturalSize }))
      },

      setHandlePosition({ event, context }) {
        const position = event.handlePosition
        if (!position) return
        context.set("handlePosition", position)
      },

      setZoom({ context, event, prop, scope }) {
        const nextZoomRaw = event.zoom
        if (!Number.isFinite(nextZoomRaw)) return

        let minZoom = prop("minZoom")
        let maxZoom = prop("maxZoom")

        if (minZoom > maxZoom) {
          ;[minZoom, maxZoom] = [maxZoom, minZoom]
        }

        const nextZoom = clampValue(nextZoomRaw, minZoom, maxZoom)

        const currentZoom = context.get("zoom")
        const currentOffsetRaw = context.get("offset")

        const bounds = dom.getViewportBounds(scope)
        const naturalSize = context.get("naturalSize")
        const viewport = { width: bounds.width, height: bounds.height }
        const clampOffset = (offset: Point, zoom: number) => clampImageOffset({ offset, zoom, viewport, naturalSize })

        if (!Number.isFinite(currentZoom) || currentZoom <= 0) {
          context.set("zoom", nextZoom)
          context.set("offset", clampOffset(currentOffsetRaw, nextZoom))
          return
        }

        const currentOffset = clampOffset(currentOffsetRaw, currentZoom)

        const crop = context.get("crop")
        const hasValidCrop =
          Number.isFinite(crop?.x) &&
          Number.isFinite(crop?.y) &&
          Number.isFinite(crop?.width) &&
          Number.isFinite(crop?.height) &&
          crop.width > 0 &&
          crop.height > 0

        const fallbackOrigin = {
          x: Number.isFinite(viewport.width) && viewport.width > 0 ? viewport.width / 2 : 0,
          y: Number.isFinite(viewport.height) && viewport.height > 0 ? viewport.height / 2 : 0,
        }

        const origin = hasValidCrop
          ? {
              x: crop.x + crop.width / 2,
              y: crop.y + crop.height / 2,
            }
          : fallbackOrigin

        if (!Number.isFinite(origin.x) || !Number.isFinite(origin.y)) {
          context.set("zoom", nextZoom)
          context.set("offset", clampOffset(currentOffset, nextZoom))
          return
        }

        const localX = (origin.x - currentOffset.x) / currentZoom
        const localY = (origin.y - currentOffset.y) / currentZoom

        if (!Number.isFinite(localX) || !Number.isFinite(localY)) {
          context.set("zoom", nextZoom)
          context.set("offset", clampOffset(currentOffset, nextZoom))
          return
        }

        const nextOffset = {
          x: origin.x - localX * nextZoom,
          y: origin.y - localY * nextZoom,
        }

        if (!Number.isFinite(nextOffset.x) || !Number.isFinite(nextOffset.y)) {
          context.set("zoom", nextZoom)
          context.set("offset", clampOffset(currentOffset, nextZoom))
          return
        }

        context.set("zoom", nextZoom)
        context.set("offset", clampOffset(nextOffset, nextZoom))
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

      clearShiftState({ context }) {
        context.set("shiftLockRatio", null)
        context.set("lastShiftKey", false)
      },

      updateZoom({ context, event, prop, scope }) {
        const delta = event.delta

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

        const viewport = { width: bounds.width, height: bounds.height }
        const clampOffset = (offset: Point, zoom: number) => clampImageOffset({ offset, zoom, viewport, naturalSize })

        const currentOffsetRaw = context.get("offset")
        const currentOffset = clampOffset(currentOffsetRaw, currentZoom)

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

      updateOffsetFromPointer({ context, event, scope }) {
        const pointerStart = context.get("pointerStart")
        const offsetStart = context.get("offsetStart")
        const currentPoint = event.point

        if (!pointerStart || !offsetStart || !currentPoint) return

        const delta = {
          x: currentPoint.x - pointerStart.x,
          y: currentPoint.y - pointerStart.y,
        }

        const nextOffset = {
          x: offsetStart.x + delta.x,
          y: offsetStart.y + delta.y,
        }

        const bounds = dom.getViewportBounds(scope)
        const viewport = { width: bounds.width, height: bounds.height }
        const zoom = context.get("zoom")
        const naturalSize = context.get("naturalSize")

        context.set("offset", clampImageOffset({ offset: nextOffset, zoom, viewport, naturalSize }))
      },

      setPinchDistance({ context, event, send }) {
        const touches = Array.isArray(event.touches) ? event.touches : []
        if (touches.length < 2) return
        const hasActivePointer = context.get("pointerStart") !== null
        if (hasActivePointer) {
          send({ type: "POINTER_UP", src: "pinch" })
        }
        const [first, second] = touches
        const dx = first.x - second.x
        const dy = first.y - second.y
        const distance = Math.hypot(dx, dy)
        if (!Number.isFinite(distance)) return
        context.set("pinchDistance", distance)
      },

      handlePinchMove({ context, event, scope, send }) {
        const touches = Array.isArray(event.touches) ? event.touches : []
        if (touches.length < 2) return

        const [first, second] = touches
        const dx = first.x - second.x
        const dy = first.y - second.y
        const distance = Math.hypot(dx, dy)
        if (!Number.isFinite(distance)) return

        const lastDistance = context.get("pinchDistance")

        const bounds = dom.getViewportBounds(scope)
        const point = {
          x: (first.x + second.x) / 2 - bounds.left,
          y: (first.y + second.y) / 2 - bounds.top,
        }

        if (
          lastDistance != null &&
          Number.isFinite(lastDistance) &&
          Number.isFinite(point.x) &&
          Number.isFinite(point.y)
        ) {
          const delta = lastDistance - distance
          if (Number.isFinite(delta)) {
            send({ type: "ZOOM", trigger: "touch", delta, point })
          }
        }

        context.set("pinchDistance", distance)
      },

      clearPinchDistance({ context }) {
        context.set("pinchDistance", null)
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
