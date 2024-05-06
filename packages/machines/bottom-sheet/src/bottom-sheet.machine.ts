import { createMachine, guards } from "@zag-js/core"
import { trackPointerMove, trackVisualViewport } from "@zag-js/dom-event"
import { nextTick, queryAll } from "@zag-js/dom-query"
import { compact, hasProp } from "@zag-js/utils"
import { dom } from "./bottom-sheet.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./bottom-sheet.types"
import { getSnapOffsets } from "./get-snap-offset"

const { and, not } = guards

const FAST_SWIPE_VELOCITY = 800
const MEDIUM_SWIPE_VELOCITY = 400

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "bottom-sheet",
      initial: "closed",
      context: {
        snapPoints: [200, "60%", "100%"],
        snapIndex: 0,
        ...ctx,
        dragOffset: null,
        viewportHeight: null,
        pointerStartPoint: null,
        visible: false,
      },

      computed: {
        snapPoint: (ctx) => ctx.snapPoints[ctx.snapIndex] ?? null,
        snapPointOffsets: (ctx) => getSnapOffsets(ctx.snapPoints, ctx.viewportHeight),
        snapPointOffset: (ctx) => ctx.snapPointOffsets[ctx.snapIndex] ?? null,
        lastSnapPointOffset: (ctx) => ctx.snapPointOffsets[ctx.snapPointOffsets.length - 1] ?? null,
      },

      watch: {
        snapIndex: ["setSnapHeight"],
      },

      entry: ["setViewportHeight"],

      activities: ["trackVisualViewport"],

      states: {
        closed: {
          tags: ["closed"],
          on: {
            open: {
              target: "open",
              actions: ["invokeOnOpen", "markScrollableRegions"],
            },
          },
        },

        open: {
          tags: ["open"],
          entry: ["setVisible", "restoreScrollYIfNeeded"],
          on: {
            "grabber.pointerdown": {
              target: "panning",
              actions: ["setPointerStart"],
            },
            close: {
              target: "closing",
              actions: ["clearVisible"],
            },
          },
        },

        panning: {
          tags: ["open"],
          activities: ["trackPointerMove"],
          entry: ["preventScrollY"],
          on: {
            "grabber.drag": {
              actions: ["setDragOffset"],
            },
            "grabber.release": [
              {
                guard: and("isFastSwipe", "hasDraggedUp"),
                target: "open",
                actions: ["setHighestSnapIndex", "clearDragOffset"],
              },
              {
                guard: "isFastSwipe",
                target: "closing",
                actions: ["clearVisible", "setDragOffsetToMax"],
              },
              {
                guard: and("isMediumSwipe", "isFirstSnap", not("hasDraggedUp")),
                target: "closing",
                actions: ["clearVisible", "setDragOffsetToMax"],
              },
              {
                guard: "isMediumSwipe",
                target: "open",
                actions: ["setPrevOrNextSnapIndex", "clearDragOffset"],
              },
              {
                target: "open",
                actions: ["setClosestSnapIndex", "clearDragOffset"],
              },
            ],
          },
        },

        closing: {
          tags: ["open"],
          after: {
            300: {
              target: "closed",
              actions: ["invokeOnClose", "clearDragOffset", "resetSnapIndex"],
            },
          },
        },
      },
    },
    {
      guards: {
        isFirstSnap: (ctx) => ctx.snapIndex === 0,
        isFastSwipe: (_ctx, evt) => evt.velocity.y > FAST_SWIPE_VELOCITY,
        isMediumSwipe: (ctx, evt) => {
          const distance = evt.point.y - ctx.pointerStartPoint!.y
          const vh = ctx.viewportHeight ?? 0
          return evt.velocity.y > MEDIUM_SWIPE_VELOCITY && Math.abs(distance) < vh * 0.4
        },
        hasDraggedUp: (ctx, evt) => {
          const distance = evt.point.y - ctx.pointerStartPoint!.y
          return distance < 0
        },
      },
      activities: {
        trackPointerMove(ctx, _evt, { send }) {
          return trackPointerMove(dom.getDoc(ctx), {
            startPoint: ctx.pointerStartPoint,
            onPointerMove({ point, velocity }) {
              send({ type: "grabber.drag", point, velocity })
            },
            onPointerUp({ point, velocity }) {
              send({ type: "grabber.release", point, velocity })
            },
          })
        },
        trackVisualViewport(ctx) {
          return trackVisualViewport(dom.getDoc(ctx), (size) => {
            ctx.viewportHeight = size.height
          })
        },
        preventScrollY(ctx) {
          const { y: elements } = dom.getScrollEls(ctx)
          elements.forEach((el) => {
            const y = el.scrollHeight > el.clientHeight
            if (y) {
              Object.assign(el, { _overflowY: el.style.overflowY })
              el.style.overflowY = "hidden"
            }
          })
        },
      },
      actions: {
        resetSnapIndex(ctx) {
          ctx.snapIndex = 0
        },
        setViewportHeight(ctx) {
          const win = dom.getWin(ctx)
          ctx.viewportHeight = win.innerHeight
        },
        setVisible(ctx) {
          nextTick(() => {
            ctx.visible = true
          })
        },
        clearVisible(ctx) {
          ctx.visible = false
        },
        clearDragOffset(ctx) {
          ctx.dragOffset = null
        },
        setDragOffsetToMax(ctx) {
          ctx.dragOffset = ctx.viewportHeight
        },
        setDragOffset(ctx, evt) {
          if (ctx.pointerStartPoint == null) return

          const distance = ctx.pointerStartPoint.y - evt.point.y
          const offset = (ctx.snapPointOffset ?? 0) - distance

          if (ctx.lastSnapPointOffset != null && offset < ctx.lastSnapPointOffset) return
          ctx.dragOffset = offset
        },
        setHighestSnapIndex(ctx) {
          ctx.snapIndex = ctx.snapPointOffsets.length - 1
        },
        setClosestSnapIndex(ctx, evt) {
          if (ctx.pointerStartPoint == null) return

          const distance = ctx.pointerStartPoint.y - evt.point.y
          const position = (ctx.snapPointOffset ?? 0) - distance

          const closest = ctx.snapPointOffsets.reduce((prev, curr) => {
            if (typeof prev !== "number" || typeof curr !== "number") return prev
            return Math.abs(curr - position) < Math.abs(prev - position) ? curr : prev
          })

          ctx.snapIndex = ctx.snapPointOffsets.indexOf(closest)
        },
        setPrevOrNextSnapIndex(ctx, evt) {
          const distance = evt.point.y - ctx.pointerStartPoint!.y
          const dragDirection = distance < 0 ? 1 : -1
          ctx.snapIndex = ctx.snapIndex + dragDirection
        },
        setPointerStart(ctx, event) {
          ctx.pointerStartPoint = event.point
        },
        setSnapHeight(ctx) {
          const contentEl = dom.getContentEl(ctx)
          if (!contentEl) return
          contentEl.style.setProperty("--snap-point-height", `${ctx.snapPoint}px`)
        },
        markScrollableRegions(ctx) {
          const contentEl = dom.getContentEl(ctx)
          if (!contentEl) return
          const elements = queryAll(contentEl, "*")
          elements.forEach((el) => {
            const x = el.scrollWidth > el.clientWidth
            const y = el.scrollHeight > el.clientHeight
            if (x || y) el.dataset.scrollable = `${x ? "x" : ""}${y ? "y" : ""}`
          })
        },
        restoreScrollYIfNeeded(ctx) {
          const isMaxSnapOffset = ctx.snapIndex === ctx.snapPoints.length - 1
          if (!isMaxSnapOffset) return
          const { y: elements } = dom.getScrollEls(ctx)
          elements.forEach((node) => {
            if (!hasProp(node, "_overflowY")) return
            node.style.overflowY = node._overflowY
            delete node._overflowY
          })
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
      },
    },
  )
}
