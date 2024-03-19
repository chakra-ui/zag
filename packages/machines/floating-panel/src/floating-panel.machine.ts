import { createMachine } from "@zag-js/core"
import { trackPointerMove } from "@zag-js/dom-event"
import { compact } from "@zag-js/utils"
import { dom } from "./floating-panel.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./floating-panel.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "floating-panel",
      initial: ctx.open ? "open" : "closed",
      context: {
        size: { width: 300, height: 300 },
        position: { x: 300, y: 100 },
        ...ctx,
        lastPosition: null,
        lastSize: null,
        dragDiff: { x: 0, y: 0 },
        resizeDiff: { x: 0, y: 0 },
      },
      states: {
        closed: {
          tags: ["closed"],
          on: {
            OPEN: {
              target: "open",
              actions: ["invokeOnOpen"],
            },
          },
        },

        open: {
          tags: ["open"],
          activities: ["trackBoundaryRect"],
          on: {
            DRAG_START: {
              target: "open.dragging",
              actions: ["setLastPosition"],
            },
            RESIZE_START: {
              target: "open.resizing",
            },
            CLOSE: {
              target: "closed",
            },
          },
        },

        "open.dragging": {
          tags: ["open"],
          activities: ["trackBoundaryRect", "trackPointerMove", "trackDockRects"],
          exit: ["resetDragDiff"],
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
            },
          },
        },

        "open.resizing": {
          tags: ["open"],
          activities: ["trackBoundaryRect", "trackPointerMove"],
          exit: ["resetResizeDiff"],
          on: {
            RESIZE: {
              actions: ["setSize"],
            },
            RESIZE_END: {
              target: "open",
              actions: ["invokeOnResizeEnd"],
            },
            CLOSE: {
              target: "closed",
              actions: ["invokeOnClose"],
            },
          },
        },
      },
    },
    {
      guards: {},
      activities: {
        trackPointerMove(ctx, _evt, { send }) {
          const doc = dom.getDoc(ctx)
          return trackPointerMove(doc, {
            onPointerMove(details) {
              send({ type: "DRAG", position: details.point })
            },
            onPointerUp() {
              send("DRAG_END")
            },
          })
        },
      },
      actions: {
        setLastPosition(ctx, evt) {
          ctx.lastPosition = evt.position
        },
        setPosition(ctx, evt) {
          const diff = {
            x: evt.position.x - ctx.lastPosition!.x,
            y: evt.position.y - ctx.lastPosition!.y,
          }
          ctx.position = {
            x: ctx.position.x + diff.x,
            y: ctx.position.y + diff.y,
          }
        },
        setSize(ctx, evt) {
          const diff = {
            x: evt.position.x - ctx.lastPosition!.x,
            y: evt.position.y - ctx.lastPosition!.y,
          }
          ctx.size = {
            width: ctx.size.width + diff.x,
            height: ctx.size.height + diff.y,
          }
        },
        resetDragDiff(ctx) {
          ctx.dragDiff = { x: 0, y: 0 }
        },
        resetResizeDiff(ctx) {
          ctx.resizeDiff = { x: 0, y: 0 }
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
