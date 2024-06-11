import { createMachine } from "@zag-js/core"
import { trackPointerMove } from "@zag-js/dom-event"
import { raf } from "@zag-js/dom-query"
import { trackElementsSize, type ElementSize } from "@zag-js/element-size"
import { trackFormControl } from "@zag-js/form-utils"
import { getValuePercent } from "@zag-js/numeric-range"
import { compact, isEqual } from "@zag-js/utils"
import { dom } from "./slider.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./slider.types"
import {
  assignArray,
  constrainValue,
  decrement,
  getClosestIndex,
  getRangeAtIndex,
  increment,
  normalizeValues,
} from "./slider.utils"

const isEqualSize = (a: ElementSize | null, b: ElementSize | null) => {
  return a?.width === b?.width && a?.height === b?.height
}

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "slider",
      initial: "idle",

      context: {
        thumbSize: null,
        thumbAlignment: "contain",
        min: 0,
        max: 100,
        step: 1,
        value: [0],
        origin: "start",
        orientation: "horizontal",
        dir: "ltr",
        minStepsBetweenThumbs: 0,
        disabled: false,
        readOnly: false,
        ...ctx,
        focusedIndex: -1,
        fieldsetDisabled: false,
      },

      computed: {
        isHorizontal: (ctx) => ctx.orientation === "horizontal",
        isVertical: (ctx) => ctx.orientation === "vertical",
        isRtl: (ctx) => ctx.orientation === "horizontal" && ctx.dir === "rtl",
        isDisabled: (ctx) => !!ctx.disabled || ctx.fieldsetDisabled,
        isInteractive: (ctx) => !(ctx.readOnly || ctx.isDisabled),
        hasMeasuredThumbSize: (ctx) => ctx.thumbSize != null,
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
          actions: "incrementThumbAtIndex",
        },
        DECREMENT: {
          actions: "decrementThumbAtIndex",
        },
      },

      states: {
        idle: {
          on: {
            POINTER_DOWN: {
              target: "dragging",
              actions: ["setClosestThumbIndex", "setPointerValue", "focusActiveThumb"],
            },
            FOCUS: {
              target: "focus",
              actions: "setFocusedIndex",
            },
            THUMB_POINTER_DOWN: {
              target: "dragging",
              actions: ["setFocusedIndex", "focusActiveThumb"],
            },
          },
        },
        focus: {
          entry: "focusActiveThumb",
          on: {
            POINTER_DOWN: {
              target: "dragging",
              actions: ["setClosestThumbIndex", "setPointerValue", "focusActiveThumb"],
            },
            THUMB_POINTER_DOWN: {
              target: "dragging",
              actions: ["setFocusedIndex", "focusActiveThumb"],
            },
            ARROW_DEC: {
              actions: ["decrementThumbAtIndex", "invokeOnChangeEnd"],
            },
            ARROW_INC: {
              actions: ["incrementThumbAtIndex", "invokeOnChangeEnd"],
            },
            HOME: {
              actions: ["setFocusedThumbToMin", "invokeOnChangeEnd"],
            },
            END: {
              actions: ["setFocusedThumbToMax", "invokeOnChangeEnd"],
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
        hasIndex: (_ctx, evt) => evt.index != null,
      },
      activities: {
        trackFormControlState(ctx, _evt, { initialContext }) {
          return trackFormControl(dom.getRootEl(ctx), {
            onFieldsetDisabledChange(disabled) {
              ctx.fieldsetDisabled = disabled
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
          if (ctx.thumbAlignment !== "contain" || ctx.thumbSize) return

          return trackElementsSize({
            getNodes: () => dom.getElements(ctx),
            observeMutation: true,
            callback(size) {
              if (!size || isEqualSize(ctx.thumbSize, size)) return
              ctx.thumbSize = size
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
        invokeOnChangeEnd(ctx) {
          ctx.onValueChangeEnd?.({ value: ctx.value })
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
        decrementThumbAtIndex(ctx, evt) {
          const value = decrement(ctx, evt.index, evt.step)
          set.value(ctx, value)
        },
        incrementThumbAtIndex(ctx, evt) {
          const value = increment(ctx, evt.index, evt.step)
          set.value(ctx, value)
        },
        setFocusedThumbToMin(ctx) {
          const { min } = getRangeAtIndex(ctx, ctx.focusedIndex)
          set.valueAtIndex(ctx, ctx.focusedIndex, min)
        },
        setFocusedThumbToMax(ctx) {
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
    ctx.onValueChange?.({
      value: Array.from(ctx.value),
    })
    dom.dispatchChangeEvent(ctx)
  },
  focusChange: (ctx: MachineContext) => {
    ctx.onFocusChange?.({
      value: Array.from(ctx.value),
      focusedIndex: ctx.focusedIndex,
    })
  },
}

const set = {
  valueAtIndex: (ctx: MachineContext, index: number, value: number) => {
    if (isEqual(ctx.value[index], value)) return
    ctx.value[index] = value
    invoke.change(ctx)
  },
  value: (ctx: MachineContext, value: number[]) => {
    if (isEqual(ctx.value, value)) return
    assignArray(ctx.value, value)
    invoke.change(ctx)
  },
  focusedIndex: (ctx: MachineContext, index: number) => {
    if (isEqual(ctx.focusedIndex, index)) return
    ctx.focusedIndex = index
    invoke.focusChange(ctx)
  },
}
