import { createMachine, guards } from "@zag-js/core"
import { trackPointerMove } from "@zag-js/dom-event"
import { isHTMLElement } from "@zag-js/dom-query"
import {
  addPoints,
  clampPoint,
  clampSize,
  createRect,
  getElementRect,
  getWindowRect,
  resizeRect,
  subtractPoints,
} from "@zag-js/rect-utils"
import { compact } from "@zag-js/utils"
import { dom } from "./floating-panel.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./floating-panel.types"

const { not } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "floating-panel",
      initial: ctx.open ? "open" : "closed",
      context: {
        size: { width: 320, height: 400 },
        position: { x: 300, y: 100 },
        gridSize: 1,
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
              guard: not("isMaximized"),
              target: "open.dragging",
              actions: ["setPrevPosition"],
            },
            RESIZE_START: {
              guard: not("isMinimized"),
              target: "open.resizing",
              actions: ["setPrevSize"],
            },
            CLOSE: {
              target: "closed",
              actions: ["invokeOnClose", "resetRect"],
            },
            ESCAPE: {
              guard: "closeOnEsc",
              target: "closed",
              actions: ["invokeOnClose", "resetRect"],
            },
            MINIMIZE: {
              actions: ["setMinimized", "invokeOnMinimize"],
            },
            MAXIMIZE: {
              actions: ["setMaximized", "invokeOnMaximize"],
            },
            RESTORE: {
              actions: ["setRestored"],
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
              actions: ["invokeOnClose", "resetRect"],
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
              actions: ["invokeOnClose", "resetRect"],
            },
            ESCAPE: {
              target: "open",
            },
          },
        },
      },
    },
    {
      guards: {
        closeOnEsc: (ctx) => !!ctx.closeOnEscape,
        isMaximized: (ctx) => ctx.stage === "maximized",
        isMinimized: (ctx) => ctx.stage === "minimized",
      },
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
          const win = dom.getWin(ctx)
          const rect = isHTMLElement(el) ? getElementRect(el) : getWindowRect(win)
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
          let diff = subtractPoints(evt.position, ctx.lastEventPosition!)

          diff.x = Math.round(diff.x / ctx.gridSize!) * ctx.gridSize!
          diff.y = Math.round(diff.y / ctx.gridSize!) * ctx.gridSize!

          const position = addPoints(ctx.prevPosition!, diff)
          const point = clampPoint(position, ctx.size, ctx.boundaryRect!)
          ctx.position = point
        },
        setPositionStyle(ctx) {
          const el = dom.getPositionerEl(ctx)
          el?.style.setProperty("--x", `${ctx.position.x}px`)
          el?.style.setProperty("--y", `${ctx.position.y}px`)
        },
        resetRect(ctx, _evt, { initialContext }) {
          ctx.stage = undefined
          if (!ctx.preserveOnClose) {
            ctx.position = initialContext.position
            ctx.size = initialContext.size
          }
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

          const prevRect = createRect({ ...ctx.prevPosition, ...ctx.prevSize })
          const offset = subtractPoints(evt.position, ctx.lastEventPosition)

          const nextRect = resizeRect(prevRect, offset, evt.axis, {
            scalingOriginMode: evt.altKey ? "center" : "extent",
            lockAspectRatio: !!ctx.lockAspectRatio || evt.shiftKey,
          })

          let nextSize = { width: nextRect.width, height: nextRect.height }
          let nextPosition = { x: nextRect.x, y: nextRect.y }

          nextSize = clampSize(nextSize, ctx.minSize, ctx.maxSize)
          ctx.size = nextSize

          if (nextPosition) {
            const point = clampPoint(nextPosition, nextSize, ctx.boundaryRect!)
            ctx.position = point
          }
        },
        setSizeStyle(ctx) {
          const el = dom.getPositionerEl(ctx)

          if (ctx.size.width != null) {
            el?.style.setProperty("--width", `${ctx.size.width}px`)
          } else {
            el?.style.removeProperty("--width")
          }

          if (ctx.size.height != null) {
            el?.style.setProperty("--height", `${ctx.size.height}px`)
          } else {
            el?.style.removeProperty("--height")
          }
        },
        setMaximized(ctx) {
          // set max size
          ctx.stage = "maximized"
          ctx.prevSize = ctx.size
          ctx.prevPosition = ctx.position
          // update size
          ctx.position = { x: 0, y: 0 }
          ctx.size = { width: ctx.boundaryRect!.width, height: ctx.boundaryRect!.height }
        },
        setMinimized(ctx) {
          // set min size
          ctx.stage = "minimized"
          ctx.prevSize = ctx.size
          ctx.prevPosition = ctx.position
          // update size
          const size: any = { ...ctx.size }
          delete size.height
          ctx.size = size
        },
        setRestored(ctx) {
          ctx.stage = undefined
          if (!ctx.prevSize || !ctx.prevPosition) return
          // restore size
          ctx.size = ctx.prevSize
          ctx.position = ctx.prevPosition
          // clear prev size
          ctx.prevSize = null
          ctx.prevPosition = null
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
