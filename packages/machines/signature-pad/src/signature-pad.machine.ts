import { createMachine } from "@zag-js/core"
import { getRelativePoint, trackPointerMove } from "@zag-js/dom-event"
import { compact } from "@zag-js/utils"
import getStroke from "perfect-freehand"
import { getSvgPathFromStroke } from "./get-svg-path"
import { dom } from "./signature-pad.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./signature-pad.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "signature-pad",
      initial: "idle",
      context: {
        ...ctx,
        paths: [],
        currentPoints: [],
        currentPath: null,
        strokeOptions: {
          size: 5,
          thinning: 0.7,
          smoothing: 0.4,
          streamline: 0.6,
          ...ctx.strokeOptions,
        },
      },

      computed: {
        isInteractive: (ctx) => !(ctx.disabled || ctx.readOnly),
        isEmpty: (ctx) => ctx.paths.length === 0,
      },

      on: {
        CLEAR: {
          actions: ["clearPoints", "invokeOnDrawEnd", "focusCanvasEl"],
        },
      },

      states: {
        idle: {
          on: {
            POINTER_DOWN: {
              target: "drawing",
              actions: ["addPoint"],
            },
          },
        },
        drawing: {
          activities: ["trackPointerMove"],
          on: {
            POINTER_MOVE: {
              actions: ["addPoint", "invokeOnDraw"],
            },
            POINTER_UP: {
              target: "idle",
              actions: ["endStroke", "invokeOnDrawEnd"],
            },
          },
        },
      },
    },
    {
      activities: {
        trackPointerMove(ctx, _evt, { send }) {
          const doc = dom.getDoc(ctx)
          return trackPointerMove(doc, {
            onPointerMove({ event, point }) {
              const { offset } = getRelativePoint(point, dom.getControlEl(ctx)!)
              send({ type: "POINTER_MOVE", point: offset, pressure: event.pressure })
            },
            onPointerUp() {
              send({ type: "POINTER_UP" })
            },
          })
        },
      },
      actions: {
        addPoint(ctx, evt) {
          ctx.currentPoints.push(evt.point)
          const stroke = getStroke(ctx.currentPoints, ctx.strokeOptions)
          ctx.currentPath = getSvgPathFromStroke(stroke)
        },
        endStroke(ctx) {
          ctx.paths.push(ctx.currentPath!)
          ctx.currentPoints = []
          ctx.currentPath = null
        },
        clearPoints(ctx) {
          ctx.currentPoints = []
          ctx.paths = []
        },
        focusCanvasEl(ctx) {
          queueMicrotask(() => {
            dom.getControlEl(ctx)?.focus({ preventScroll: true })
          })
        },
        invokeOnDraw(ctx) {
          ctx.onValueChange?.({
            paths: [...ctx.paths, ctx.currentPath!],
          })
        },
        invokeOnDrawEnd(ctx) {
          ctx.onValueChangeEnd?.({
            paths: [...ctx.paths],
            dataUrl(type, quality = 0.92) {
              return ctx.isEmpty ? "" : dom.getCanvasEl(ctx).toDataURL(type, quality)
            },
          })
        },
      },
    },
  )
}
