import { createMachine, ref } from "@ui-machines/core"
import { nextTick, trackPointerMove } from "@ui-machines/dom-utils"
import { clamp, decrement, increment, snapToStep } from "@ui-machines/number-utils"
import { relativeToNode } from "@ui-machines/rect-utils"
import { dom } from "./split-view.dom"
import { MachineContext, MachineState } from "./split-view.types"

export const machine = createMachine<MachineContext, MachineState>(
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
            actions: "setupDocument",
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
      setupDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
        ctx.uid = evt.id
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
