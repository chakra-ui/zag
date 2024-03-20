import { createMachine } from "@zag-js/core"
import { trackPointerMove } from "@zag-js/dom-event"
import { compact } from "@zag-js/utils"
import { dom } from "./floating-panel.dom"
import type {
  MachineContext,
  MachineState,
  Position,
  ResizeTriggerAxis,
  Size,
  UserDefinedContext,
} from "./floating-panel.types"
import { addPosition, subtractPosition } from "./utils/math"

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
        lastEventPosition: null,
        prevPosition: null,
        prevSize: null,
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
            },
          },
        },

        "open.resizing": {
          tags: ["open"],
          activities: ["trackPointerMove"],
          exit: ["clearLastSize"],
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
            onPointerMove({ point, event }) {
              const altKey = event.altKey
              send({ type: "DRAG", position: point, axis: _evt.axis, altKey })
            },
            onPointerUp() {
              send("DRAG_END")
            },
          })
        },
      },
      actions: {
        setPrevPosition(ctx, evt) {
          ctx.prevPosition = { ...ctx.position }
          ctx.lastEventPosition = evt.position
        },
        clearPrevPosition(ctx) {
          ctx.prevPosition = null
          ctx.lastEventPosition = null
        },
        setPosition(ctx, evt) {
          const diff = subtractPosition(evt.position, ctx.lastEventPosition!)
          ctx.position = addPosition(ctx.prevPosition!, diff)
        },
        setPositionStyle(ctx) {
          const el = dom.getPositionerEl(ctx)
          el?.style.setProperty("--x", `${ctx.position.x}px`)
          el?.style.setProperty("--y", `${ctx.position.y}px`)
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
          const factor = evt.altKey ? 2 : 1

          let nextSize: Size | undefined
          let nextPosition: Position | undefined

          switch (evt.axis as ResizeTriggerAxis) {
            case "n": {
              nextSize = {
                width: ctx.prevSize!.width,
                height: ctx.prevSize.height - diff.y * factor,
              }
              nextPosition = {
                y: ctx.prevPosition.y + diff.y,
                x: ctx.prevPosition.x,
              }
              break
            }
            case "e": {
              nextSize = {
                width: ctx.prevSize.width + diff.x * factor,
                height: ctx.prevSize.height,
              }
              nextPosition = {
                y: ctx.prevPosition.y,
                x: evt.altKey ? ctx.prevPosition.x - diff.x : ctx.prevPosition.x,
              }
              break
            }
            case "w": {
              nextSize = {
                width: ctx.prevSize.width - diff.x * factor,
                height: ctx.prevSize.height,
              }
              nextPosition = {
                y: ctx.prevPosition.y,
                x: evt.altKey ? ctx.prevPosition.x + diff.x : ctx.prevPosition.x,
              }
              break
            }
            case "s": {
              nextSize = {
                width: ctx.prevSize.width,
                height: ctx.prevSize.height + diff.y * factor,
              }
              nextPosition = {
                y: evt.altKey ? ctx.prevPosition.y - diff.y : ctx.prevPosition.y,
                x: ctx.prevPosition.x,
              }
              break
            }
            case "ne": {
              nextSize = {
                width: ctx.prevSize.width + diff.x * factor,
                height: ctx.prevSize.height - diff.y * factor,
              }
              nextPosition = {
                y: ctx.prevPosition.y + diff.y,
                x: evt.altKey ? ctx.prevPosition.x - diff.x : ctx.prevPosition.x,
              }
              break
            }
            case "se": {
              nextSize = {
                width: ctx.prevSize.width + diff.x * factor,
                height: ctx.prevSize.height + diff.y * factor,
              }
              nextPosition = {
                x: evt.altKey ? ctx.prevPosition.x - diff.x : ctx.prevPosition.x,
                y: evt.altKey ? ctx.prevPosition.y - diff.y : ctx.prevPosition.y,
              }
              break
            }
            case "sw": {
              nextSize = {
                width: ctx.prevSize.width - diff.x,
                height: ctx.prevSize.height + diff.y,
              }
              nextPosition = {
                y: ctx.prevPosition.y,
                x: ctx.prevPosition.x + diff.x,
              }
              break
            }
            case "nw": {
              nextSize = {
                width: ctx.prevSize.width - diff.x,
                height: ctx.prevSize.height - diff.y,
              }
              nextPosition = {
                y: ctx.prevPosition.y + diff.y,
                x: ctx.prevPosition.x + diff.x,
              }
              break
            }
            default: {
              throw new Error(`Invalid axis: ${evt.axis}`)
            }
          }

          ctx.size = nextSize

          if (nextPosition) {
            ctx.position = nextPosition
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
