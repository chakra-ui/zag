import { createMachine, ref, guards } from "@ui-machines/core"
import { nextTick, trackPointerMove } from "@ui-machines/dom-utils"
import { clamp, decrement, increment, snapToStep } from "@ui-machines/number-utils"
import { relativeToNode } from "@ui-machines/rect-utils"
import { dom } from "./splitter.dom"
import { MachineContext, MachineState } from "./splitter.types"

const { not } = guards

export const machine = createMachine<MachineContext, MachineState>(
  {
    id: "splitter",
    initial: "unknown",
    context: {
      uid: "",
      orientation: "horizontal",
      min: 224,
      max: 340,
      step: 1,
      value: 256,
      snapOffset: 0,
    },
    computed: {
      isHorizontal: (ctx) => ctx.orientation === "horizontal",
      isAtMin: (ctx) => ctx.value === ctx.min,
      isAtMax: (ctx) => ctx.value === ctx.max,
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
          POINTER_OVER: {
            guard: not("isFixed"),
            target: "hover:temp",
          },
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
        tags: ["focus"],
        on: {
          POINTER_DOWN: "dragging",
          POINTER_LEAVE: "idle",
        },
      },

      focused: {
        tags: ["focus"],
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
        tags: ["focus"],
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
        const el = dom.getDoc(ctx).documentElement
        return trackPointerMove({
          ctx,
          onPointerMove(info) {
            send({ type: "POINTER_MOVE", point: info.point })
            el.style.cursor = dom.getCursor(ctx)
          },
          onPointerUp() {
            send("POINTER_UP")
            el.style.cursor = ""
          },
        })
      },
    },
    guards: {
      isCollapsed: (ctx) => ctx.isAtMin,
      isHorizontal: (ctx) => ctx.isHorizontal,
      isVertical: (ctx) => !ctx.isHorizontal,
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
        let value = parseFloat(snapToStep(clamp(point.x, ctx), ctx.step))

        if (Math.abs(value - ctx.min) <= ctx.snapOffset) {
          value = ctx.min
        } else if (Math.abs(value - ctx.max) <= ctx.snapOffset) {
          value = ctx.max
        }

        ctx.value = value
      },
    },
  },
)
