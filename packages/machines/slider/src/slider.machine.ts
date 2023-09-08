import { createMachine } from "@zag-js/core"
import { trackPointerMove } from "@zag-js/dom-event"
import { raf } from "@zag-js/dom-query"
import { trackElementSize } from "@zag-js/element-size"
import { trackFormControl } from "@zag-js/form-utils"
import { clampValue, getValuePercent } from "@zag-js/numeric-range"
import { compact, isEqual } from "@zag-js/utils"
import { dom } from "./slider.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./slider.types"
import { constrainValue, decrement, increment } from "./slider.utils"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "slider",
      initial: "idle",
      context: {
        thumbSize: null,
        thumbAlignment: "contain",
        threshold: 5,
        dir: "ltr",
        origin: "start",
        orientation: "horizontal",
        value: 0,
        step: 1,
        min: 0,
        max: 100,
        disabled: false,
        ...ctx,
        fieldsetDisabled: false,
      },

      computed: {
        isHorizontal: (ctx) => ctx.orientation === "horizontal",
        isVertical: (ctx) => ctx.orientation === "vertical",
        isRtl: (ctx) => ctx.orientation === "horizontal" && ctx.dir === "rtl",
        isDisabled: (ctx) => ctx.disabled || ctx.fieldsetDisabled,
        isInteractive: (ctx) => !(ctx.isDisabled || ctx.readOnly),
        hasMeasuredThumbSize: (ctx) => ctx.thumbSize !== null,
        valuePercent: (ctx) => 100 * getValuePercent(ctx.value, ctx.min, ctx.max),
      },

      watch: {
        value: ["syncInputElement"],
      },

      activities: ["trackFormControlState", "trackThumbSize"],

      on: {
        SET_VALUE: {
          actions: "setValue",
        },
        INCREMENT: {
          actions: "increment",
        },
        DECREMENT: {
          actions: "decrement",
        },
      },

      entry: ["checkValue"],

      states: {
        idle: {
          on: {
            POINTER_DOWN: {
              target: "dragging",
              actions: ["setPointerValue", "invokeOnChangeStart", "focusThumb"],
            },
            FOCUS: "focus",
            THUMB_POINTER_DOWN: {
              target: "dragging",
              actions: ["invokeOnChangeStart", "focusThumb"],
            },
          },
        },

        focus: {
          entry: "focusThumb",
          on: {
            POINTER_DOWN: {
              target: "dragging",
              actions: ["setPointerValue", "invokeOnChangeStart", "focusThumb"],
            },
            THUMB_POINTER_DOWN: {
              target: "dragging",
              actions: ["invokeOnChangeStart", "focusThumb"],
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
            PAGE_UP: {
              actions: "increment",
            },
            PAGE_DOWN: {
              actions: "decrement",
            },
            HOME: {
              actions: "setToMin",
            },
            END: {
              actions: "setToMax",
            },
            BLUR: "idle",
          },
        },

        dragging: {
          entry: "focusThumb",
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
        trackFormControlState(ctx, _evt, { initialContext }) {
          return trackFormControl(dom.getHiddenInputEl(ctx), {
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
        trackThumbSize(ctx, _evt) {
          if (ctx.thumbAlignment !== "contain" || ctx.thumbSize) return
          return trackElementSize(dom.getThumbEl(ctx), (size) => {
            if (size) ctx.thumbSize = size
          })
        },
      },

      actions: {
        checkValue(ctx) {
          ctx.value = constrainValue(ctx, ctx.value)
        },
        invokeOnChangeStart(ctx) {
          ctx.onChangeStart?.({ value: ctx.value })
        },
        invokeOnChangeEnd(ctx) {
          ctx.onChangeEnd?.({ value: ctx.value })
        },
        setPointerValue(ctx, evt) {
          const value = dom.getValueFromPoint(ctx, evt.point)
          if (value == null) return
          set.value(ctx, clampValue(value, ctx.min, ctx.max))
        },
        focusThumb(ctx) {
          raf(() => dom.getThumbEl(ctx)?.focus({ preventScroll: true }))
        },
        decrement(ctx, evt) {
          const value = decrement(ctx, evt.step)
          set.value(ctx, value)
        },
        increment(ctx, evt) {
          const value = increment(ctx, evt.step)
          set.value(ctx, value)
        },
        setToMin(ctx) {
          set.value(ctx, ctx.min)
        },
        setToMax(ctx) {
          set.value(ctx, ctx.max)
        },
        setValue(ctx, evt) {
          const value = constrainValue(ctx, evt.value)
          set.value(ctx, value)
        },
        syncInputElement(ctx) {
          const inputEl = dom.getHiddenInputEl(ctx)
          dom.setValue(inputEl, ctx.value)
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
}

const set = {
  value: (ctx: MachineContext, value: number) => {
    if (isEqual(ctx.value, value)) return
    ctx.value = value
    invoke.change(ctx)
  },
}
