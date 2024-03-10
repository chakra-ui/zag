import { createMachine } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./floating-panel.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "floating-panel",
      initial: ctx.open ? "open" : "closed",
      context: {
        size: { width: 300, height: 300 },
        position: { x: 0, y: 0 },
        ...ctx,
        dragDiff: { x: 0, y: 0 },
        resizeDiff: { x: 0, y: 0 },
      },
      states: {
        closed: {
          tags: ["closed"],
          on: {
            OPEN: { target: "open" },
          },
        },

        open: {
          tags: ["open"],
          activities: ["trackBoundaryRect"],
          on: {
            DRAG_START: {
              target: "open.dragging",
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
            DRAG: {},
            DRAG_END: {},
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
            RESIZE: {},
            RESIZE_END: {},
            CLOSE: {
              target: "closed",
            },
          },
        },
      },
    },
    {
      guards: {},
      actions: {
        resetDragDiff(ctx) {
          ctx.dragDiff = { x: 0, y: 0 }
        },
        resetResizeDiff(ctx) {
          ctx.resizeDiff = { x: 0, y: 0 }
        },
      },
    },
  )
}
