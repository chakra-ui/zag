import { createMachine } from "@zag-js/core"
import { getRelativePoint, trackPointerMove } from "@zag-js/dom-query"
import getStroke from "perfect-freehand"
import { getSvgPathFromStroke } from "./get-svg-path"
import * as dom from "./signature-pad.dom"
import type { Point, SignaturePadSchema } from "./signature-pad.types"

export const machine = createMachine<SignaturePadSchema>({
  props({ props }) {
    return {
      ...props,
      drawing: {
        size: 2,
        simulatePressure: false,
        thinning: 0.7,
        smoothing: 0.4,
        streamline: 0.6,
        ...props.drawing,
      },
      translations: {
        control: "signature pad",
        clearTrigger: "clear signature",
        ...props.translations,
      },
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable }) {
    return {
      paths: bindable<string[]>(() => ({
        defaultValue: [],
        sync: true,
        onChange(value) {
          prop("onDraw")?.({ paths: value })
        },
      })),
      currentPoints: bindable<Point[]>(() => ({
        defaultValue: [],
      })),
      currentPath: bindable<string | null>(() => ({
        defaultValue: null,
      })),
    }
  },

  computed: {
    isInteractive: ({ prop }) => !(prop("disabled") || prop("readOnly")),
    isEmpty: ({ context }) => context.get("paths").length === 0,
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
      effects: ["trackPointerMove"],
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

  implementations: {
    effects: {
      trackPointerMove({ scope, send }) {
        const doc = scope.getDoc()
        return trackPointerMove(doc, {
          onPointerMove({ event, point }) {
            const controlEl = dom.getControlEl(scope)
            if (!controlEl) return
            const { offset } = getRelativePoint(point, controlEl)
            send({ type: "POINTER_MOVE", point: offset, pressure: event.pressure })
          },
          onPointerUp() {
            send({ type: "POINTER_UP" })
          },
        })
      },
    },
    actions: {
      addPoint({ context, event, prop }) {
        const nextPoints = [...context.get("currentPoints"), event.point]
        context.set("currentPoints", nextPoints)
        const stroke = getStroke(nextPoints, prop("drawing"))
        context.set("currentPath", getSvgPathFromStroke(stroke))
      },
      endStroke({ context }) {
        context.set("paths", [...context.get("paths"), context.get("currentPath")!])
        context.set("currentPoints", [])
        context.set("currentPath", null)
      },
      clearPoints({ context }) {
        context.set("currentPoints", [])
        context.set("paths", [])
      },
      focusCanvasEl({ scope }) {
        queueMicrotask(() => {
          scope.getActiveElement()?.focus({ preventScroll: true })
        })
      },
      invokeOnDraw({ context, prop }) {
        prop("onDraw")?.({
          paths: [...context.get("paths"), context.get("currentPath")!],
        })
      },
      invokeOnDrawEnd({ context, prop, scope, computed }) {
        prop("onDrawEnd")?.({
          paths: [...context.get("paths")],
          getDataUrl(type, quality = 0.92) {
            if (computed("isEmpty")) return Promise.resolve("")
            return dom.getDataUrl(scope, { type, quality })
          },
        })
      },
    },
  },
})
