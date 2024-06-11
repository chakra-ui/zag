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
        readOnly: false,
        disabled: false,
        ...ctx,
        paths: [],
        currentPoints: [],
        currentPath: null,
        drawing: {
          size: 2,
          simulatePressure: false,
          thinning: 0.7,
          smoothing: 0.4,
          streamline: 0.6,
          ...ctx.drawing,
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
          const stroke = getStroke(ctx.currentPoints, ctx.drawing)
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
          ctx.onDraw?.({
            paths: [...ctx.paths, ctx.currentPath!],
          })
        },
        invokeOnDrawEnd(ctx) {
          ctx.onDrawEnd?.({
            paths: [...ctx.paths],
            getDataUrl(type, quality = 0.92) {
              return dom.getDataUrl(ctx, { type, quality })
            },
          })
        },
      },
    },
  )
}
