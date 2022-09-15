import { createMachine, guards } from "@zag-js/core"
import { raf, trackPointerMove, getPointRelativeToNode } from "@zag-js/dom-utils"
import { clamp, decrement, increment, snapToStep } from "@zag-js/number-utils"
import { dom } from "./splitter.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./splitter.types"
import { utils } from "./splitter.utils"

const { not } = guards

export function machine(ctx: UserDefinedContext) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "splitter",
      initial: "unknown",
      context: {
        orientation: "horizontal",
        min: 30,
        max: Infinity,
        step: 1,
        values: [],
        defaultValues: [],
        snapOffset: 5,
        focusedSeparator: null,
        ...ctx,
      },

      computed: {
        isHorizontal: (ctx) => ctx.orientation === "horizontal",
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
        SET_SIZE: {
          actions: "setSize",
        },
        RESET: {
          actions: "reset",
        },
      },
      states: {
        unknown: {
          on: {
            SETUP: { actions: ["setDefaultValues"], target: "idle" },
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
            POINTER_DOWN: {
              target: "dragging",
              actions: ["invokeOnChangeStart"],
            },
            POINTER_LEAVE: "idle",
          },
        },

        hover: {
          tags: ["focus"],
          on: {
            POINTER_DOWN: {
              target: "dragging",
              actions: ["invokeOnChangeStart"],
            },
            POINTER_LEAVE: "idle",
          },
        },

        focused: {
          tags: ["focus"],
          on: {
            BLUR: { actions: ["clearFocusedSeparator"], target: "idle" },
            POINTER_DOWN: {
              target: "dragging",
              actions: ["invokeOnChangeStart"],
            },
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
          entry: "focusSeparator",
          activities: "trackPointerMove",
          on: {
            POINTER_UP: {
              target: "focused",
              actions: ["invokeOnChangeEnd"],
            },
            POINTER_MOVE: {
              actions: ["setPrevPaneValues", "setPointerValue"],
            },
          },
        },
      },
    },
    {
      activities: {
        trackPointerMove: (ctx, _evt, { send }) => {
          const doc = dom.getDoc(ctx)
          return trackPointerMove(doc, {
            onPointerMove(info) {
              send({ type: "POINTER_MOVE", index: _evt.index, point: info.point })
              doc.documentElement.style.cursor = dom.getCursor(ctx, _evt.index)
            },
            onPointerUp() {
              send({ type: "POINTER_UP", id: _evt.id })
              doc.documentElement.style.cursor = ""
            },
          })
        },
      },
      guards: {
        isCollapsed: (ctx, evt) => {
          const value = utils.getValueAtIndex(ctx.values, evt.index)
          const min = utils.getValueAtIndex(ctx.min, evt.index)
          return value === min
        },
        isHorizontal: (ctx) => ctx.isHorizontal,
        isVertical: (ctx) => !ctx.isHorizontal,
        isFixed: (ctx, evt) => !!ctx.fixed?.[evt.index],
      },
      delays: {
        HOVER_DELAY: 250,
      },
      actions: {
        invokeOnChange(ctx, evt) {
          if (evt.type !== "SETUP") {
            const values = ctx.values
            const value = utils.getValueAtIndex(values, evt.index)
            ctx.onChange?.({ value, index: evt.index, values })
          }
        },
        invokeOnChangeStart(ctx, evt) {
          const values = ctx.values
          const value = utils.getValueAtIndex(values, evt.index)
          ctx.onChangeStart?.({ value, index: evt.index, values })
        },
        invokeOnChangeEnd(ctx, evt) {
          const values = ctx.values
          const value = utils.getValueAtIndex(values, evt.index)
          ctx.onChangeEnd?.({ value, index: evt.index, values })
        },

        setToMin(ctx, evt) {
          const min = utils.getValueAtIndex(ctx.min, evt.index)
          ctx.values[evt.index] = min
        },
        setToMax(ctx, evt) {
          const max = utils.getValueAtIndex(ctx.max, evt.index)
          console.log("max :>> ", max)
          ctx.values[evt.index] = max
        },
        increment(ctx, evt) {
          const value = utils.getPaneValue(ctx, evt.index)
          const max = clamp(increment(value, evt.step), {
            min: utils.getValueAtIndex(ctx.min, evt.index),
            max: utils.getValueAtIndex(ctx.max, evt.index),
          })
          ctx.values[evt.index] = max
        },
        decrement(ctx, evt) {
          const value = utils.getPaneValue(ctx, evt.index)
          const max = clamp(decrement(value, evt.step), {
            min: utils.getValueAtIndex(ctx.min, evt.index),
            max: utils.getValueAtIndex(ctx.max, evt.index),
          })
          ctx.values[evt.index] = max
        },
        focusSeparator(ctx, evt) {
          raf(() => {
            dom.getSeparatorEl(ctx, evt.index)?.focus()
            ctx.focusedSeparator = evt.index
          })
        },
        clearFocusedSeparator(ctx) {
          ctx.focusedSeparator = null
        },
        setPrevPaneValues(ctx, evt) {
          for (let i = 0; i < evt.index; i++) {
            const value = ctx.values[i]
            if (typeof value !== "undefined") return
            const paneWidth = utils.computePaneWidth(ctx, i)
            ctx.values[i] = paneWidth
          }
        },
        setPointerValue(ctx, evt) {
          const el = dom.getPaneEl(ctx, evt.index)
          if (!el) return

          const relativePoint = getPointRelativeToNode(evt.point, el)
          let currentPoint = ctx.isHorizontal ? relativePoint.x : relativePoint.y
          const min = utils.getValueAtIndex(ctx.min, evt.index)
          const max = utils.getValueAtIndex(ctx.max, evt.index)
          const step = utils.getValueAtIndex(ctx.step, evt.index)

          let value = parseFloat(snapToStep(clamp(currentPoint, { min, max }), step))

          if (Math.abs(value - min) <= ctx.snapOffset) {
            value = min
          } else if (Math.abs(value - max) <= ctx.snapOffset) {
            value = max
          }
          ctx.values[evt.index] = value
        },
        setSize(ctx, evt) {
          ctx.values[evt.index] = evt.size
        },
        reset(ctx) {
          ctx.values = ctx.defaultValues
        },
        setDefaultValues(ctx) {
          ctx.defaultValues = ctx.values
        },
      },
    },
  )
}
