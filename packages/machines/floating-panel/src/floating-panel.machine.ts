import { createMachine } from "@zag-js/core"
import { trackPointerMove } from "@zag-js/dom-event"
import { isHTMLElement } from "@zag-js/dom-query"
import { getElementRect, getWindowRect } from "@zag-js/rect-utils"
import { compact } from "@zag-js/utils"
import { dom } from "./floating-panel.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./floating-panel.types"
import { getDiffRect } from "./utils/get-diff-rect"
import { addPosition, clampPosition, clampSize, subtractPosition } from "./utils/math"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "floating-panel",
      initial: ctx.open ? "open" : "closed",
      context: {
        size: { width: 320, height: 400 },
        position: { x: 300, y: 100 },
        ...ctx,
        lastEventPosition: null,
        prevPosition: null,
        prevSize: null,
        boundaryRect: null,
      },

      watch: {
        position: ["setPositionStyle"],
        size: ["setSizeStyle"],
      },

      states: {
        closed: {
          tags: ["closed"],
          on: {
            OPEN: {
              target: "open",
              actions: ["invokeOnOpen", "setPositionStyle", "setSizeStyle"],
            },
          },
        },

        open: {
          tags: ["open"],
          entry: ["setBoundaryRect"],
          on: {
            DRAG_START: {
              target: "open.dragging",
              actions: ["setPrevPosition"],
            },
            RESIZE_START: {
              target: "open.resizing",
              actions: ["setPrevSize"],
            },
            CLOSE: {
              target: "closed",
              actions: ["invokeOnClose", "resetPosition", "resetSize"],
            },
            ESCAPE: {
              target: "closed",
              actions: ["invokeOnClose", "resetPosition", "resetSize"],
            },
          },
        },

        "open.dragging": {
          tags: ["open"],
          activities: ["trackPointerMove"],
          exit: ["clearPrevPosition"],
          on: {
            DRAG: {
              actions: ["setPosition"],
            },
            DRAG_END: {
              target: "open",
              actions: ["invokeOnDragEnd"],
            },
            CLOSE: {
              target: "closed",
              actions: ["invokeOnClose", "resetPosition", "resetSize"],
            },
            ESCAPE: {
              target: "open",
            },
          },
        },

        "open.resizing": {
          tags: ["open"],
          activities: ["trackPointerMove"],
          exit: ["clearPrevSize"],
          on: {
            DRAG: {
              actions: ["setSize"],
            },
            DRAG_END: {
              target: "open",
              actions: ["invokeOnResizeEnd"],
            },
            CLOSE: {
              target: "closed",
              actions: ["invokeOnClose", "resetPosition", "resetSize"],
            },
            ESCAPE: {
              target: "open",
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
            onPointerMove({ point, event }) {
              const { altKey, shiftKey } = event
              send({ type: "DRAG", position: point, axis: _evt.axis, altKey, shiftKey })
            },
            onPointerUp() {
              send("DRAG_END")
            },
          })
        },
      },
      actions: {
        setBoundaryRect(ctx) {
          const el = ctx.getBoundaryEl?.()
          const rect = (() => {
            if (isHTMLElement(el)) return getElementRect(el)
            return getWindowRect(dom.getWin(ctx))
          })()
          ctx.boundaryRect = { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
        },
        setPrevPosition(ctx, evt) {
          ctx.prevPosition = { ...ctx.position }
          ctx.lastEventPosition = evt.position
        },
        clearPrevPosition(ctx) {
          if (!ctx.preserveOnClose) ctx.prevPosition = null
          ctx.lastEventPosition = null
        },
        setPosition(ctx, evt) {
          const diff = subtractPosition(evt.position, ctx.lastEventPosition!)
          let position = addPosition(ctx.prevPosition!, diff)
          position = clampPosition(position, ctx.size, ctx.boundaryRect!)
          ctx.position = position
        },
        setPositionStyle(ctx) {
          const el = dom.getPositionerEl(ctx)
          el?.style.setProperty("--x", `${ctx.position.x}px`)
          el?.style.setProperty("--y", `${ctx.position.y}px`)
        },
        resetPosition(ctx, _evt, { initialContext }) {
          if (ctx.preserveOnClose) return
          ctx.position = initialContext.position
        },
        resetSize(ctx, _evt, { initialContext }) {
          if (ctx.preserveOnClose) return
          ctx.size = initialContext.size
        },
        setPrevSize(ctx, evt) {
          ctx.prevSize = { ...ctx.size }
          ctx.prevPosition = { ...ctx.position }
          ctx.lastEventPosition = evt.position
        },
        clearPrevSize(ctx) {
          ctx.prevSize = null
          ctx.prevPosition = null
          ctx.lastEventPosition = null
        },
        setSize(ctx, evt) {
          if (!ctx.prevSize || !ctx.prevPosition || !ctx.lastEventPosition) return

          const diff = subtractPosition(evt.position, ctx.lastEventPosition)

          const { nextSize, nextPosition } = getDiffRect({
            diff,
            axis: evt.axis,
            prevPosition: ctx.prevPosition,
            prevSize: ctx.prevSize,
            altKey: evt.altKey,
          })

          const size = clampSize(nextSize, ctx.minSize, ctx.maxSize)
          ctx.size = size

          if (nextPosition) {
            const position = clampPosition(nextPosition, size, ctx.boundaryRect!)
            ctx.position = position
          }
        },
        setSizeStyle(ctx) {
          const el = dom.getPositionerEl(ctx)
          el?.style.setProperty("--width", `${ctx.size.width}px`)
          el?.style.setProperty("--height", `${ctx.size.height}px`)
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        invokeOnDragEnd(ctx) {
          ctx.onDragEnd?.({ position: ctx.position })
        },
        invokeOnResizeEnd(ctx) {
          ctx.onResizeEnd?.({ size: ctx.size })
        },
      },
    },
  )
}
