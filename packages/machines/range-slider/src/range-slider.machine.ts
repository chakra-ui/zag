import { createMachine, ref } from "@ui-machines/core"
import { nextTick, trackPointerMove } from "@ui-machines/dom-utils"
import { clamp, decrement, increment, snapToStep } from "@ui-machines/number-utils"
import { getElementRect } from "@ui-machines/rect-utils"
import { isNumber } from "@ui-machines/utils"
import { dom, getClosestIndex, getRangeAtIndex } from "./range-slider.dom"
import { MachineContext, MachineState } from "./range-slider.types"

export const machine = createMachine<MachineContext, MachineState>(
  {
    id: "range-slider-machine",
    initial: "unknown",

    context: {
      thumbSize: null,
      uid: "48",
      threshold: 5,
      activeIndex: -1,
      min: 0,
      max: 100,
      step: 1,
      value: [0, 100],
      orientation: "horizontal",
      dir: "ltr",
      minStepsBetweenThumbs: 0,
    },

    computed: {
      isHorizontal: (ctx) => ctx.orientation === "horizontal",
      isVertical: (ctx) => ctx.orientation === "vertical",
      isRtl: (ctx) => ctx.orientation === "horizontal" && ctx.dir === "rtl",
      isInteractive: (ctx) => !(ctx.readonly || ctx.disabled),
    },

    watch: {
      value: ["invokeOnChange", "dispatchChangeEvent"],
    },

    on: {
      SET_VALUE: { actions: "setValue" },
      INCREMENT: { actions: "increment" },
      DECREMENT: { actions: "decrement" },
    },

    states: {
      unknown: {
        on: {
          SETUP: {
            target: "idle",
            actions: ["setupDocument", "setThumbSize"],
          },
        },
      },
      idle: {
        on: {
          POINTER_DOWN: {
            target: "dragging",
            actions: ["setActiveIndex", "invokeOnChangeStart", "setPointerValue", "focusActiveThumb"],
          },
          FOCUS: {
            target: "focus",
            actions: "setActiveIndex",
          },
        },
      },
      focus: {
        entry: "focusActiveThumb",
        on: {
          POINTER_DOWN: {
            target: "dragging",
            actions: ["setActiveIndex", "invokeOnChangeStart", "setPointerValue", "focusActiveThumb"],
          },
          ARROW_LEFT: {
            guard: "isHorizontal",
            actions: "decrementAtIndex",
          },
          ARROW_RIGHT: {
            guard: "isHorizontal",
            actions: "incrementAtIndex",
          },
          ARROW_UP: {
            guard: "isVertical",
            actions: "incrementAtIndex",
          },
          ARROW_DOWN: {
            guard: "isVertical",
            actions: "decrementAtIndex",
          },
          PAGE_UP: {
            actions: "incrementAtIndex",
          },
          PAGE_DOWN: {
            actions: "decrementAtIndex",
          },
          HOME: {
            actions: "setActiveThumbToMin",
          },
          END: {
            actions: "setActiveThumbToMax",
          },
          BLUR: {
            target: "idle",
            actions: "clearActiveIndex",
          },
        },
      },
      dragging: {
        entry: "focusActiveThumb",
        activities: "trackPointerMove",
        on: {
          POINTER_UP: {
            target: "focus",
            actions: "invokeOnChangeEnd",
          },
          POINTER_MOVE: {
            actions: "setPointerValue",
          },
        },
      },
    },
  },
  {
    guards: {
      isHorizontal: (ctx) => ctx.isHorizontal,
      isVertical: (ctx) => ctx.isVertical,
    },
    activities: {
      trackPointerMove(ctx, _evt, { send }) {
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
    actions: {
      setupDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
        ctx.uid = evt.id
      },
      invokeOnChangeStart(ctx) {
        ctx.onChangeStart?.(ctx.value)
      },
      invokeOnChangeEnd(ctx) {
        ctx.onChangeEnd?.(ctx.value)
      },
      invokeOnChange(ctx) {
        ctx.onChange?.(ctx.value)
      },
      dispatchChangeEvent(ctx) {
        dom.dispatchChangeEvent(ctx)
      },
      setThumbSize(ctx) {
        nextTick(() => {
          const thumbs = dom.getElements(ctx)
          ctx.thumbSize = thumbs.map((thumb) => {
            const { width, height } = getElementRect(thumb)
            return { width, height }
          })
        })
      },
      setActiveIndex(ctx, evt) {
        ctx.activeIndex = getClosestIndex(ctx, evt)
      },
      clearActiveIndex(ctx) {
        ctx.activeIndex = -1
      },
      setPointerValue(ctx, evt) {
        const value = dom.getValueFromPoint(ctx, evt.point)
        const range = getRangeAtIndex(ctx, ctx.activeIndex)
        if (value == null) return
        ctx.value[ctx.activeIndex] = clamp(value, range)
      },
      focusActiveThumb(ctx) {
        nextTick(() => {
          const thumb = dom.getThumbEl(ctx, ctx.activeIndex)
          thumb?.focus()
        })
      },
      decrementAtIndex(ctx, evt) {
        const index = evt.index ?? ctx.activeIndex
        const range = getRangeAtIndex(ctx, index)
        const value = snapToStep(decrement(range.value, evt.step), ctx.step)
        ctx.value[ctx.activeIndex] = parseFloat(value)
      },
      incrementAtIndex(ctx, evt) {
        const index = evt.index ?? ctx.activeIndex
        const range = getRangeAtIndex(ctx, index)
        const value = snapToStep(increment(range.value, evt.step), ctx.step)
        ctx.value[ctx.activeIndex] = parseFloat(value)
      },
      setActiveThumbToMin(ctx) {
        const { min } = getRangeAtIndex(ctx)
        ctx.value[ctx.activeIndex] = min
      },
      setActiveThumbToMax(ctx) {
        const { max } = getRangeAtIndex(ctx)
        ctx.value[ctx.activeIndex] = max
      },
      setValue(ctx, evt) {
        // set value at specified index
        if (isNumber(evt.index) && isNumber(evt.value)) {
          ctx.value[evt.index] = evt.value
          return
        }
        // set values
        if (Array.isArray(evt.value)) {
          ctx.value = evt.value
        }
      },
    },
  },
)
