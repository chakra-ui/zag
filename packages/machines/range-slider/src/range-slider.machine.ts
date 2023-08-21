import { createMachine } from "@zag-js/core"
import { trackPointerMove } from "@zag-js/dom-event"
import { raf } from "@zag-js/dom-query"
import { trackElementsSize } from "@zag-js/element-size"
import { trackFormControl } from "@zag-js/form-utils"
import { getValuePercent } from "@zag-js/numeric-range"
import { compact } from "@zag-js/utils"
import { dom } from "./range-slider.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./range-slider.types"
import {
  assignArray,
  constrainValue,
  decrement,
  getClosestIndex,
  getRangeAtIndex,
  increment,
  normalizeValues,
} from "./range-slider.utils"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "range-slider",
      initial: "idle",

      context: {
        thumbSizes: [],
        thumbAlignment: "contain",
        threshold: 5,
        focusedIndex: -1,
        min: 0,
        max: 100,
        step: 1,
        value: [0, 100],
        orientation: "horizontal",
        dir: "ltr",
        minStepsBetweenThumbs: 0,
        ...ctx,
      },

      computed: {
        isHorizontal: (ctx) => ctx.orientation === "horizontal",
        isVertical: (ctx) => ctx.orientation === "vertical",
        isRtl: (ctx) => ctx.orientation === "horizontal" && ctx.dir === "rtl",
        isInteractive: (ctx) => !(ctx.readOnly || ctx.disabled),
        spacing: (ctx) => ctx.minStepsBetweenThumbs * ctx.step,
        hasMeasuredThumbSize: (ctx) => ctx.thumbSizes.length !== 0,
        valuePercent(ctx) {
          return ctx.value.map((value) => 100 * getValuePercent(value, ctx.min, ctx.max))
        },
      },

      watch: {
        value: ["syncInputElements"],
      },

      entry: ["coarseValue"],

      activities: ["trackFormControlState", "trackThumbsSize"],

      on: {
        SET_VALUE: [
          {
            guard: "hasIndex",
            actions: "setValueAtIndex",
          },
          { actions: "setValue" },
        ],
        INCREMENT: {
          actions: "incrementAtIndex",
        },
        DECREMENT: {
          actions: "decrementAtIndex",
        },
      },

      states: {
        idle: {
          on: {
            POINTER_DOWN: {
              target: "dragging",
              actions: ["setClosestThumbIndex", "setPointerValue", "invokeOnChangeStart", "focusActiveThumb"],
            },
            FOCUS: {
              target: "focus",
              actions: "setFocusedIndex",
            },
          },
        },
        focus: {
          entry: "focusActiveThumb",
          on: {
            POINTER_DOWN: {
              target: "dragging",
              actions: ["setClosestThumbIndex", "setPointerValue", "invokeOnChangeStart", "focusActiveThumb"],
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
              actions: "clearFocusedIndex",
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
        hasIndex: (_ctx, evt) => evt.index != null,
      },
      activities: {
        trackFormControlState(ctx, _evt, { initialContext }) {
          return trackFormControl(dom.getRootEl(ctx), {
            onFieldsetDisabledChange(disabled) {
              ctx.disabled = disabled
            },
            onFormReset() {
              set.value(ctx, initialContext.value)
            },
          })
        },

        trackPointerMove(ctx, _evt, { send }) {
          return trackPointerMove(dom.getDoc(ctx), {
            onPointerMove(info) {
              send({ type: "POINTER_MOVE", point: info.point })
            },
            onPointerUp() {
              send("POINTER_UP")
            },
          })
        },
        trackThumbsSize(ctx) {
          if (ctx.thumbAlignment !== "contain") return
          return trackElementsSize({
            getNodes() {
              return dom.getElements(ctx)
            },
            observeMutation: true,
            callback(size, index) {
              if (size) {
                ctx.thumbSizes[index] = size
              }
            },
          })
        },
      },
      actions: {
        syncInputElements(ctx) {
          ctx.value.forEach((value, index) => {
            const inputEl = dom.getHiddenInputEl(ctx, index)
            dom.setValue(inputEl, value)
          })
        },
        invokeOnChangeStart(ctx) {
          ctx.onChangeStart?.({ value: ctx.value })
        },
        invokeOnChangeEnd(ctx) {
          ctx.onChangeEnd?.({ value: ctx.value })
        },
        setClosestThumbIndex(ctx, evt) {
          const pointValue = dom.getValueFromPoint(ctx, evt.point)
          if (pointValue == null) return

          const focusedIndex = getClosestIndex(ctx, pointValue)
          set.focusedIndex(ctx, focusedIndex)
        },
        setFocusedIndex(ctx, evt) {
          set.focusedIndex(ctx, evt.index)
        },
        clearFocusedIndex(ctx) {
          set.focusedIndex(ctx, -1)
        },
        setPointerValue(ctx, evt) {
          const pointerValue = dom.getValueFromPoint(ctx, evt.point)
          if (pointerValue == null) return

          const value = constrainValue(ctx, pointerValue, ctx.focusedIndex)
          set.valueAtIndex(ctx, ctx.focusedIndex, value)
        },
        focusActiveThumb(ctx) {
          raf(() => {
            const thumbEl = dom.getThumbEl(ctx, ctx.focusedIndex)
            thumbEl?.focus({ preventScroll: true })
          })
        },
        decrementAtIndex(ctx, evt) {
          const value = decrement(ctx, evt.index, evt.step)
          set.value(ctx, value)
        },
        incrementAtIndex(ctx, evt) {
          const value = increment(ctx, evt.index, evt.step)
          set.value(ctx, value)
        },
        setActiveThumbToMin(ctx) {
          const { min } = getRangeAtIndex(ctx, ctx.focusedIndex)
          set.valueAtIndex(ctx, ctx.focusedIndex, min)
        },
        setActiveThumbToMax(ctx) {
          const { max } = getRangeAtIndex(ctx, ctx.focusedIndex)
          set.valueAtIndex(ctx, ctx.focusedIndex, max)
        },
        coarseValue(ctx) {
          const value = normalizeValues(ctx, ctx.value)
          set.value(ctx, value)
        },
        setValueAtIndex(ctx, evt) {
          const value = constrainValue(ctx, evt.value, evt.index)
          set.valueAtIndex(ctx, evt.index, value)
        },
        setValue(ctx, evt) {
          const value = normalizeValues(ctx, evt.value)
          set.value(ctx, value)
        },
      },
    },
  )
}

const invoke = {
  change: (ctx: MachineContext) => {
    ctx.onChange?.({ value: ctx.value })
    dom.dispatchChangeEvent(ctx)
  },
  focusChange: (ctx: MachineContext) => {
    ctx.onFocusChange?.({ value: ctx.value, index: ctx.focusedIndex })
  },
}
const set = {
  valueAtIndex: (ctx: MachineContext, index: number, value: number) => {
    ctx.value[index] = value
    invoke.change(ctx)
  },
  value: (ctx: MachineContext, value: number[]) => {
    assignArray(ctx.value, value)
    invoke.change(ctx)
  },
  focusedIndex: (ctx: MachineContext, index: number) => {
    ctx.focusedIndex = index
    invoke.focusChange(ctx)
  },
}
