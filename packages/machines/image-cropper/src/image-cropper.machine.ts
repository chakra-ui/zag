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
      defaultZoom: 1,
      zoomStep: 0.25,
      minZoom: 1,
      maxZoom: 5,
      defaultRotation: 0,
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
      rotation: bindable<number>(() => ({
        defaultValue: prop("defaultRotation"),
        value: prop("rotation"),
        onChange(rotation) {
          prop("onRotationChange")?.({ rotation })
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
      actions: ["updateZoom"],
    },
    SET_ROTATION: {
      actions: ["setRotation"],
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
          actions: ["setPointerStart", "setOffsetStart"],
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
      hasBounds({ scope }) {
        const bounds = dom.getViewportBounds(scope)
        return bounds.width > 0 && bounds.height > 0
      },
      canPan({ context, scope }) {
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

      updatePanOffset({ context, event, scope }) {
        const point = event.point
        const pointerStart = context.get("pointerStart")
        const offsetStart = context.get("offsetStart")
        const zoom = context.get("zoom")
        const rotation = context.get("rotation")

        if (!point || !pointerStart || !offsetStart) return
        if (!Number.isFinite(zoom) || zoom <= 0) return

        const bounds = dom.getViewportBounds(scope)
        const deltaX = point.x - pointerStart.x
        const deltaY = point.y - pointerStart.y

        // Convert rotation to radians and take absolute cos/sin for AABB
        const theta = ((rotation % 360) * Math.PI) / 180
        const c = Math.abs(Math.cos(theta))
        const s = Math.abs(Math.sin(theta))

        // Size of the content after zoom (before rotation)
        const contentW = bounds.width * zoom
        const contentH = bounds.height * zoom

        // Axis-aligned bounding box of the rotated rect
        // (classic rotated-rect AABB formula)
        const aabbW = contentW * c + contentH * s
        const aabbH = contentW * s + contentH * c

        // How much larger than the viewport the rotated content is
        const extraWidth = Math.max(0, aabbW - bounds.width)
        const extraHeight = Math.max(0, aabbH - bounds.height)

        // Pan limits so the viewport always stays within the rotated content
        const minX = -extraWidth / 2
        const maxX = extraWidth / 2
        const minY = -extraHeight / 2
        const maxY = extraHeight / 2

        const startX = Number.isFinite(offsetStart.x) ? offsetStart.x : 0
        const startY = Number.isFinite(offsetStart.y) ? offsetStart.y : 0

        const nextOffset = {
          x: clampValue(startX + deltaX, minX, maxX),
          y: clampValue(startY + deltaY, minY, maxY),
        }

        context.set("offset", nextOffset)
      },

      setHandlePosition({ event, context }) {
        const position = event.handlePosition
        if (!position) return
        context.set("handlePosition", position)
      },

      setRotation({ context, event }) {
        const rotation = event.rotation
        if (!Number.isFinite(rotation)) return
        const nextRotation = clampValue(rotation, 0, 360)
        context.set("rotation", nextRotation)
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
        let { delta, point, zoom: targetZoom } = event

        // If no point is specified, zoom based on the center of the crop area
        if (!point) {
          const crop = context.get("crop")
          point = { x: crop.x + crop.width / 2, y: crop.y + crop.height / 2 }
        }

        const step = Math.abs(prop("zoomStep"))
        const [minZoom, maxZoom] = [prop("minZoom"), prop("maxZoom")]
        const currentZoom = context.get("zoom")

        if (!Number.isFinite(currentZoom) || currentZoom <= 0) return

        let nextZoom
        if (typeof targetZoom === "number" && Number.isFinite(targetZoom)) {
          nextZoom = clampValue(targetZoom, minZoom, maxZoom)
        } else if (typeof delta === "number" && Number.isFinite(delta)) {
          const direction = Math.sign(delta) < 0 ? 1 : -1
          nextZoom = clampValue(currentZoom + step * direction, minZoom, maxZoom)
        } else {
          return
        }
        if (nextZoom === currentZoom) return

        const { width: vpW, height: vpH } = dom.getViewportBounds(scope)
        const centerX = vpW / 2
        const centerY = vpH / 2

        const currentOffset = context.get("offset")

        const ratio = nextZoom / currentZoom
        let nextOffset = {
          x: (1 - ratio) * (point.x - centerX) + ratio * currentOffset.x,
          y: (1 - ratio) * (point.y - centerY) + ratio * currentOffset.y,
        }

        if (nextZoom < currentZoom) {
          const imgSize = context.get("naturalSize")
          const scaledW = imgSize.width * nextZoom
          const scaledH = imgSize.height * nextZoom

          if (Number.isFinite(scaledW) && Number.isFinite(scaledH)) {
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
