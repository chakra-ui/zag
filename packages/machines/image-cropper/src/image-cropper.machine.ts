import { createMachine } from "@zag-js/core"
import * as dom from "./image-cropper.dom"
import type { HandlePosition, ImageCropperSchema } from "./image-cropper.types"
import type { Point, Rect, Size } from "@zag-js/types"
import { addDomEvent, getEventPoint, getEventTarget } from "@zag-js/dom-query"
import { computeMoveCrop, computeResizeCrop } from "./image-cropper.utils"

export const machine = createMachine<ImageCropperSchema>({
  props({ props }) {
    return {
      initialCrop: { x: 0, y: 0, width: 50, height: 50 },
      minCropSize: { width: 40, height: 40 },
      ...props,
    }
  },

  context({ bindable, prop }) {
    return {
      naturalSize: bindable<Size>(() => ({
        defaultValue: { width: 0, height: 0 },
      })),
      bounds: bindable<Size>(() => ({
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
          actions: ["setBounds", "setPointerStart", "setCropStart", "setHandlePosition"],
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
      },
    },
  },

  implementations: {
    guards: {
      hasBounds({ scope }) {
        const viewportEl = dom.getViewportEl(scope)
        if (!viewportEl) return false
        const bounds = viewportEl?.getBoundingClientRect()
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

      setBounds({ scope, context }) {
        const viewportEl = dom.getViewportEl(scope)
        if (!viewportEl) return
        const bounds = viewportEl?.getBoundingClientRect()
        context.set("bounds", { width: bounds.width, height: bounds.height })
      },

      setPointerStart({ event, context }) {
        const point = event.point

        context.set("pointerStart", point)
      },

      setCropStart({ context }) {
        const crop = context.get("crop")
        context.set("cropStart", crop)
      },

      updateCrop({ context, event, prop }) {
        const minCropSize = prop("minCropSize")
        const handlePosition = context.get("handlePosition")
        const pointerStart = context.get("pointerStart")
        const cropStart = context.get("cropStart")
        const bounds = context.get("bounds")
        let aspectRatio = prop("aspectRatio")
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
            cropStart: cropStart,
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
