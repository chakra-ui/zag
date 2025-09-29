import { createMachine } from "@zag-js/core"
import * as dom from "./image-cropper.dom"
import type { CropRect, HandlePosition, ImageCropperSchema } from "./image-cropper.types"
import type { Point, Size } from "@zag-js/types"
import { addDomEvent, getEventPoint, getEventTarget } from "@zag-js/dom-query"
import { clampValue } from "@zag-js/utils"

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
      crop: bindable<CropRect>(() => ({
        defaultValue: prop("initialCrop"),
      })),
      pointerStart: bindable<Point | null>(() => ({
        defaultValue: null,
      })),
      cropStart: bindable<CropRect | null>(() => ({
        defaultValue: null,
      })),
      handlePosition: bindable<HandlePosition | null>(() => ({
        defaultValue: null,
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
          actions: ["clearPointerStart", "clearCropStart", "clearHandlePosition"],
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
        const crop = context.get("cropStart")
        const bounds = context.get("bounds")
        const currentPoint = event.point

        if (!pointerStart || !crop) return

        const dx = currentPoint.x - pointerStart.x
        const dy = currentPoint.y - pointerStart.y

        let nextCrop: CropRect

        // If handlePosition is set, we are resizing the crop area
        if (handlePosition) {
          let left = crop.x
          let top = crop.y
          let right = crop.x + crop.width
          let bottom = crop.y + crop.height

          const minWidth = Math.min(minCropSize.width, bounds.width)
          const minHeight = Math.min(minCropSize.height, bounds.height)

          const hasLeft = handlePosition.includes("left")
          const hasRight = handlePosition.includes("right")
          const hasTop = handlePosition.includes("top")
          const hasBottom = handlePosition.includes("bottom")

          if (hasLeft) {
            const nextLeft = clampValue(left + dx, 0, right - minWidth)
            left = Math.min(nextLeft, right - minWidth)
          }

          if (hasRight) {
            const nextRight = clampValue(right + dx, left + minWidth, bounds.width)
            right = Math.max(nextRight, left + minWidth)
          }

          if (hasTop) {
            const nextTop = clampValue(top + dy, 0, bottom - minHeight)
            top = Math.min(nextTop, bottom - minHeight)
          }

          if (hasBottom) {
            const nextBottom = clampValue(bottom + dy, top + minHeight, bounds.height)
            bottom = Math.max(nextBottom, top + minHeight)
          }

          const width = clampValue(right - left, minWidth, bounds.width)
          const height = clampValue(bottom - top, minHeight, bounds.height)

          nextCrop = { x: left, y: top, width, height }
        } else {
          nextCrop = {
            x: clampValue(crop.x + dx, 0, bounds.width - crop.width),
            y: clampValue(crop.y + dy, 0, bounds.height - crop.height),
            width: crop.width,
            height: crop.height,
          }
        }

        context.set("crop", nextCrop)
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
    },

    effects: {
      trackPointerMove({ scope, send }) {
        function onPointerMove(event: PointerEvent) {
          const point = getEventPoint(event)
          const target = getEventTarget<Element>(event)
          send({ type: "POINTER_MOVE", point, target })
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
