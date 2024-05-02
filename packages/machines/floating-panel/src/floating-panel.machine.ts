import { createMachine, guards, subscribe } from "@zag-js/core"
import { addDomEvent, trackPointerMove } from "@zag-js/dom-event"
import { isHTMLElement, raf } from "@zag-js/dom-query"
import {
  addPoints,
  clampPoint,
  clampSize,
  constrainRect,
  createRect,
  getElementRect,
  isPointEqual,
  isSizeEqual,
  resizeRect,
  subtractPoints,
  type Point,
  type Size,
} from "@zag-js/rect-utils"
import { compact, invariant, isEqual, match, pick } from "@zag-js/utils"
import { dom } from "./floating-panel.dom"
import { panelStack } from "./floating-panel.store"
import type { MachineContext, MachineState, Stage, UserDefinedContext } from "./floating-panel.types"

const { not } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "floating-panel",
      initial: ctx.open ? "open" : "closed",
      context: {
        allowOverflow: true,
        strategy: "absolute",
        size: { width: 320, height: 400 },
        position: { x: 300, y: 100 },
        gridSize: 1,
        disabled: false,
        resizable: true,
        draggable: true,
        ...ctx,
        stage: undefined,
        lastEventPosition: null,
        prevPosition: null,
        prevSize: null,
        isTopmost: false,
      },

      computed: {
        isMaximized: (ctx) => ctx.stage === "maximized",
        isMinimized: (ctx) => ctx.stage === "minimized",
        isStaged: (ctx) => !!ctx.stage,
        canResize: (ctx) => (ctx.resizable || !ctx.disabled) && !ctx.stage,
        canDrag: (ctx) => (ctx.draggable || !ctx.disabled) && !ctx.isMaximized,
      },

      watch: {
        position: ["setPositionStyle"],
        size: ["setSizeStyle"],
      },

      activities: ["trackPanelStack"],

      on: {
        WINDOW_FOCUS: {
          actions: ["bringToFrontOfPanelStack"],
        },
      },

      states: {
        closed: {
          tags: ["closed"],
          on: {
            OPEN: {
              target: "open",
              actions: ["invokeOnOpen", "setAnchorPosition", "setPositionStyle", "setSizeStyle"],
            },
          },
        },

        open: {
          tags: ["open"],
          entry: ["bringToFrontOfPanelStack"],
          activities: ["trackBoundaryRect"],
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
            MOVE: {
              actions: ["setPositionFromKeybord"],
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
        isMaximized: (ctx) => ctx.isMaximized,
        isMinimized: (ctx) => ctx.isMinimized,
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
        trackBoundaryRect(ctx) {
          const win = dom.getWin(ctx)

          // ResizeObserver fires immediately on init, so we need to skip the first call
          let skip = true

          const exec = () => {
            if (skip) {
              skip = false
              return
            }

            let boundaryRect = dom.getBoundaryRect(ctx, false)

            if (!ctx.isMaximized) {
              const rect = { ...ctx.position, ...ctx.size }
              boundaryRect = constrainRect(rect, boundaryRect)
            }

            set.size(ctx, pick(boundaryRect, ["width", "height"]))
            set.position(ctx, pick(boundaryRect, ["x", "y"]))
          }

          const boundaryEl = ctx.getBoundaryEl?.()

          if (isHTMLElement(boundaryEl)) {
            const obs = new win.ResizeObserver(exec)
            obs.observe(boundaryEl)
            return () => obs.disconnect()
          }

          return addDomEvent(win, "resize", exec)
        },
        trackPanelStack(ctx, _evt) {
          const unsub = subscribe(panelStack, () => {
            ctx.isTopmost = panelStack.isTopmost(ctx.id)
          })

          return () => {
            panelStack.remove(ctx.id)
            unsub()
          }
        },
      },
      actions: {
        setAnchorPosition(ctx) {
          // if we persisted the rect, we don't need to set the anchor position
          if (ctx.persistRect && (ctx.prevPosition || ctx.prevSize)) return
          raf(() => {
            const triggerRect = dom.getTriggerEl(ctx)
            const boundaryRect = dom.getBoundaryRect(ctx, false)
            const anchorPosition = ctx.getAnchorPosition?.({
              triggerRect: triggerRect ? DOMRect.fromRect(getElementRect(triggerRect)) : null,
              boundaryRect: DOMRect.fromRect(boundaryRect),
            })
            if (!anchorPosition) return
            ctx.position = anchorPosition
          })
        },
        setPrevPosition(ctx, evt) {
          ctx.prevPosition = { ...ctx.position }
          ctx.lastEventPosition = evt.position
        },
        clearPrevPosition(ctx) {
          if (!ctx.persistRect) ctx.prevPosition = null
          ctx.lastEventPosition = null
        },
        setPosition(ctx, evt) {
          let diff = subtractPoints(evt.position, ctx.lastEventPosition!)

          diff.x = Math.round(diff.x / ctx.gridSize) * ctx.gridSize
          diff.y = Math.round(diff.y / ctx.gridSize) * ctx.gridSize

          let position = addPoints(ctx.prevPosition!, diff)

          const boundaryRect = dom.getBoundaryRect(ctx, ctx.allowOverflow)
          position = clampPoint(position, ctx.size, boundaryRect)

          set.position(ctx, position)
        },
        setPositionStyle(ctx) {
          const el = dom.getPositionerEl(ctx)
          el?.style.setProperty("--x", `${ctx.position.x}px`)
          el?.style.setProperty("--y", `${ctx.position.y}px`)
        },
        resetRect(ctx, _evt, { initialContext }) {
          ctx.stage = undefined
          if (!ctx.persistRect) {
            set.position(ctx, initialContext.position)
            set.size(ctx, initialContext.size)
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

          let nextSize = pick(nextRect, ["width", "height"])
          let nextPosition = pick(nextRect, ["x", "y"])

          const boundaryRect = dom.getBoundaryRect(ctx, false)

          nextSize = clampSize(nextSize, ctx.minSize, ctx.maxSize)
          nextSize = clampSize(nextSize, ctx.minSize, boundaryRect)
          set.size(ctx, nextSize)

          if (nextPosition) {
            const point = clampPoint(nextPosition, nextSize, boundaryRect)
            set.position(ctx, point)
          }
        },
        setSizeStyle(ctx) {
          const el = dom.getPositionerEl(ctx)
          el?.style.setProperty("--width", `${ctx.size.width}px`)
          el?.style.setProperty("--height", `${ctx.size.height}px`)
        },
        setMaximized(ctx) {
          // set max stage
          set.stage(ctx, "maximized")

          // save previous
          ctx.prevSize = ctx.size
          ctx.prevPosition = ctx.position

          // update size and position
          const boundaryRect = dom.getBoundaryRect(ctx, false)
          set.position(ctx, pick(boundaryRect, ["x", "y"]))
          set.size(ctx, pick(boundaryRect, ["height", "width"]))
        },
        setMinimized(ctx) {
          // set min stage
          set.stage(ctx, "minimized")

          // save previous
          ctx.prevSize = ctx.size
          ctx.prevPosition = ctx.position

          // update size
          const headerEl = dom.getHeaderEl(ctx)
          if (!headerEl) return
          const size = {
            ...ctx.size,
            height: headerEl?.offsetHeight,
          }
          set.size(ctx, size)
        },
        setRestored(ctx) {
          const boundaryRect = dom.getBoundaryRect(ctx, false)

          // remove stage
          set.stage(ctx, undefined)

          // restore size
          if (ctx.prevSize) {
            let nextSize = ctx.prevSize
            nextSize = clampSize(nextSize, ctx.minSize, ctx.maxSize)
            nextSize = clampSize(nextSize, ctx.minSize, boundaryRect)

            set.size(ctx, nextSize)
            ctx.prevSize = null
          }

          // restore position
          if (ctx.prevPosition) {
            let nextPosition = ctx.prevPosition
            nextPosition = clampPoint(nextPosition, ctx.size, boundaryRect)

            set.position(ctx, nextPosition)
            ctx.prevPosition = null
          }
        },
        setPositionFromKeybord(ctx, evt) {
          invariant(evt.step == null, "step is required")

          let nextPosition = match(evt.direction, {
            left: { x: ctx.position.x - evt.step, y: ctx.position.y },
            right: { x: ctx.position.x + evt.step, y: ctx.position.y },
            up: { x: ctx.position.x, y: ctx.position.y - evt.step },
            down: { x: ctx.position.x, y: ctx.position.y + evt.step },
          })

          const boundaryRect = dom.getBoundaryRect(ctx, false)
          nextPosition = clampPoint(nextPosition, ctx.size, boundaryRect)
          set.position(ctx, nextPosition)
        },
        addToPanelStack(ctx) {
          panelStack.add(ctx.id)
        },
        bringToFrontOfPanelStack(ctx) {
          panelStack.bringToFront(ctx.id)
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        invokeOnDragEnd(ctx) {
          ctx.onPositionChangeEnd?.({ position: ctx.position })
        },
        invokeOnResizeEnd(ctx) {
          ctx.onSizeChangeEnd?.({ size: ctx.size })
        },
        invokeOnMinimize(ctx) {
          ctx.onStageChange?.({ stage: "minimized" })
        },
        invokeOnMaximize(ctx) {
          ctx.onStageChange?.({ stage: "maximized" })
        },
      },
    },
  )
}

const set = {
  size(ctx: MachineContext, value: Size) {
    if (isSizeEqual(ctx.size, value)) return
    ctx.size = value
    ctx.onSizeChange?.({ size: value })
  },
  position(ctx: MachineContext, value: Point) {
    if (isPointEqual(ctx.position, value)) return
    ctx.position = value
    ctx.onPositionChange?.({ position: value })
  },
  stage(ctx: MachineContext, value: Stage | undefined) {
    if (isEqual(ctx.stage, value)) return
    ctx.stage = value
    ctx.onStageChange?.({ stage: value })
  },
}
