import { createMachine, ref } from "@ui-machines/core"
import { nextTick } from "@ui-machines/dom-utils"
import { trackPointerMove } from "@ui-machines/dom-utils/pointer-event"
import { clamp, decrement, increment, snapToStep } from "@ui-machines/number-utils"
import { relativeToNode } from "@ui-machines/point-utils/dom"
import { Context } from "@ui-machines/utils"
import { dom } from "./split-view.dom"

export type SplitViewMachineContext = Context<{
  /**
   * Whether to allow the separator to be dragged.
   */
  fixed?: boolean
  /**
   * The orientation of the split view.
   */
  orientation: "horizontal" | "vertical"
  /**
   * The minimum size of the primary pane.
   */
  min: number
  /**
   * The maximum size of the primary pane.
   */
  max: number
  /**
   * The size of the primary pane.
   */
  value: number
  /**
   * The step increments of the primary pane when it is dragged
   * or resized with keyboard.
   */
  step: number
  /**
   * Callback to be invoked when the primary pane is resized.
   */
  onChange?: (size: number) => void
  /**
   * Whether the primary pane is disabled.
   */
  disabled?: boolean
  readonly isCollapsed: boolean
  readonly isHorizontal: boolean
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
    computed: {
      isHorizontal: (ctx) => ctx.orientation === "horizontal",
      isCollapsed: (ctx) => ctx.value === ctx.min,
    },
    on: {
      COLLAPSE: {
        actions: "setToMin",
      },
      EXPAND: {
        actions: "setToMax",
      },
      TOGGLE: [
        {
          guard: "isCollapsed",
          actions: "setToMax",
        },
        {
          actions: "setToMin",
        },
      ],
    },
    states: {
      unknown: {
        on: {
          SETUP: {
            target: "idle",
            actions: ["setId", "setOwnerDocument"],
          },
        },
      },

      idle: {
        on: {
          POINTER_OVER: "hover:temp",
          POINTER_LEAVE: "idle",
          FOCUS: "focused",
        },
      },

      "hover:temp": {
        after: {
          HOVER_DELAY: "hover",
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
          POINTER_DOWN: "dragging",
          ARROW_LEFT: {
            guard: "isHorizontal",
            actions: "decrement",
          },
          ARROW_RIGHT: {
            guard: "isHorizontal",
            actions: "increment",
          },
          ARROW_UP: {
            guard: "isVertical",
            actions: "increment",
          },
          ARROW_DOWN: {
            guard: "isVertical",
            actions: "decrement",
          },
          ENTER: [
            {
              guard: "isCollapsed",
              actions: "setToMin",
            },
            { actions: "setToMin" },
          ],
          HOME: {
            actions: "setToMin",
          },
          END: {
            actions: "setToMax",
          },
          DOUBLE_CLICK: [
            {
              guard: "isCollapsed",
              actions: "setToMax",
            },
            { actions: "setToMin" },
          ],
        },
      },

      dragging: {
        entry: "focusSplitter",
        activities: "trackPointerMove",
        on: {
          POINTER_UP: "focused",
          POINTER_MOVE: {
            actions: "setPointerValue",
          },
        },
      },
    },
  },
  {
    activities: {
      trackPointerMove: (ctx, _evt, { send }) => {
        return trackPointerMove({
          ctx,
          onPointerMove(info) {
            send({ type: "POINTER_MOVE", point: info.point })
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
      isFixed: (ctx) => !!ctx.fixed,
    },
    delays: {
      HOVER_DELAY: 250,
    },
    actions: {
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
      },
      setToMin(ctx) {
        ctx.value = ctx.min
      },
      setToMax(ctx) {
        ctx.value = ctx.max
      },
      increment(ctx, evt) {
        ctx.value = clamp(increment(ctx.value, evt.step), ctx)
      },
      decrement(ctx, evt) {
        ctx.value = clamp(decrement(ctx.value, evt.step), ctx)
      },
      focusSplitter(ctx) {
        nextTick(() => dom.getSplitterEl(ctx)?.focus())
      },
      setPointerValue(ctx, evt) {
        const primaryPane = dom.getPrimaryPaneEl(ctx)
        if (!primaryPane) return
        const { point } = relativeToNode(evt.point, primaryPane)
        ctx.value = parseFloat(snapToStep(clamp(point.x, ctx), ctx.step))
      },
    },
  },
)
