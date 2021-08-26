import { focus } from "@core-dom/event"
import { NumericRange } from "@core-foundation/numeric-range"
import { createMachine, preserve, guards } from "@ui-machines/core"
import { trackPointerMove } from "../utils/pointer-move"
import { WithDOM } from "../utils/types"
import { getElements } from "./split-view.dom"

const { not } = guards

export type SplitViewMachineContext = WithDOM<{
  fixed?: boolean
  orientation: "horizontal" | "vertical"
  min: number
  max: number
  value: number
  step: number
  onChange?: (size: number) => void
  disabled?: boolean
}>

export type SplitViewMachineState = {
  value: "unknown" | "idle" | "hover:temp" | "hover" | "dragging" | "focused"
}

export const splitViewMachine = createMachine<SplitViewMachineContext, SplitViewMachineState>(
  {
    id: "split-view-machine",
    initial: "unknown",
    context: {
      uid: "spliter",
      orientation: "horizontal",
      min: 224,
      max: 340,
      step: 1,
      value: 256,
    },
    on: {
      SETUP: {
        target: "idle",
        actions: ["setId", "setOwnerDocument"],
      },
    },
    states: {
      idle: {
        on: {
          POINTER_OVER: "hover:temp",
          FOCUS: "focused",
          POINTER_LEAVE: "idle",
        },
      },

      "hover:temp": {
        after: {
          500: "hover",
        },
        on: {
          POINTER_DOWN: "dragging",
          POINTER_LEAVE: "idle",
        },
      },

      hover: {
        on: {
          POINTER_DOWN: "dragging",
          POINTER_LEAVE: "idle",
        },
      },

      focused: {
        on: {
          BLUR: "idle",
          ARROW_LEFT: {
            cond: "isHorizontal",
            actions: ["decrement"],
          },
          ARROW_RIGHT: {
            cond: "isHorizontal",
            actions: ["increment"],
          },
          ARROW_UP: {
            cond: "isVertical",
            actions: ["increment"],
          },
          ARROW_DOWN: {
            cond: "isVertical",
            actions: ["decrement"],
          },
          ENTER: [
            { cond: "isCollapsed", actions: ["setToMin"] },
            { cond: not("isCollapsed"), actions: ["setToMin"] },
          ],
          HOME: {
            actions: ["setToMin"],
          },
          END: {
            actions: ["setToMax"],
          },
          POINTER_DOWN: "dragging",
        },
      },

      dragging: {
        entry: "focusSplitter",
        activities: "trackPointerMove",
        on: {
          POINTER_UP: "focused",
        },
      },
    },
  },
  {
    activities: {
      trackPointerMove: (ctx, _evt, { send }) => {
        return trackPointerMove({
          ctx,
          onPointerMove(event, info) {
            const { primaryPane } = getElements(ctx)
            if (!primaryPane) return
            const { point } = info.point.relativeToNode(primaryPane)
            const range = new NumericRange({
              min: ctx.min,
              max: ctx.max,
              step: ctx.step,
              value: point.x,
            })
            ctx.value = range.clamp().snapToStep().valueOf()
          },
          onPointerUp() {
            send("POINTER_UP")
          },
        })
      },
    },
    guards: {
      isCollapsed: (ctx) => ctx.value === ctx.min,
      isHorizontal: (ctx) => ctx.orientation === "horizontal",
      isVertical: (ctx) => ctx.orientation === "vertical",
    },
    actions: {
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = preserve(evt.doc)
      },
      setToMin(ctx) {
        ctx.value = ctx.min
      },
      setToMax(ctx) {
        ctx.value = ctx.max
      },
      increment(ctx) {
        ctx.value = add(ctx.value, ctx.step)
      },
      decrement(ctx) {
        ctx.value = add(ctx.value, -ctx.step)
      },
      focusSplitter(ctx) {
        const { splitter } = getElements(ctx)
        if (!splitter) return
        focus.nextTick(splitter)
      },
    },
  },
)

const add = (a: number, b: number) => (a * 10 + b * 10) / 10
