import { createMachine } from "@zag-js/core"
import { raf, trackPointerMove } from "@zag-js/dom-utils"
import { trackFormControl } from "@zag-js/form-utils"
import { trackElementSize } from "@zag-js/element-size"
import { compact } from "@zag-js/utils"
import { dom } from "./slider.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./slider.types"
import { utils } from "./slider.utils"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "slider",
      initial: "unknown",
      context: {
        thumbSize: null,
        thumbAlignment: "contain",
        disabled: false,
        threshold: 5,
        dir: "ltr",
        origin: "start",
        orientation: "horizontal",
        initialValue: null,
        value: 0,
        step: 1,
        min: 0,
        max: 100,
        ...ctx,
      },

      computed: {
        isHorizontal: (ctx) => ctx.orientation === "horizontal",
        isVertical: (ctx) => ctx.orientation === "vertical",
        isRtl: (ctx) => ctx.orientation === "horizontal" && ctx.dir === "rtl",
        isInteractive: (ctx) => !(ctx.disabled || ctx.readOnly),
        hasMeasuredThumbSize: (ctx) => ctx.thumbSize !== null,
      },

      watch: {
        value: ["invokeOnChange", "dispatchChangeEvent"],
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

      states: {
        unknown: {
          on: {
            SETUP: {
              target: "idle",
              actions: ["checkValue"],
            },
          },
        },

        idle: {
          on: {
            POINTER_DOWN: {
              target: "dragging",
              actions: ["setPointerValue", "invokeOnChangeStart", "focusThumb"],
            },
            FOCUS: "focus",
          },
        },

        focus: {
          entry: "focusThumb",
          on: {
            POINTER_DOWN: {
              target: "dragging",
              actions: ["setPointerValue", "invokeOnChangeStart", "focusThumb"],
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
        trackFormControlState(ctx) {
          return trackFormControl(dom.getHiddenInputEl(ctx), {
            onFieldsetDisabled() {
              ctx.disabled = true
            },
            onFormReset() {
              if (ctx.initialValue != null) {
                ctx.value = ctx.initialValue
              }
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
          if (ctx.thumbAlignment !== "contain") return
          return trackElementSize(dom.getThumbEl(ctx), (size) => {
            if (size) ctx.thumbSize = size
          })
        },
      },

      actions: {
        checkValue(ctx) {
          const value = utils.convert(ctx, ctx.value)
          ctx.value = value
          ctx.initialValue = value
        },
        invokeOnChangeStart(ctx) {
          ctx.onChangeStart?.({ value: ctx.value })
        },
        invokeOnChangeEnd(ctx) {
          ctx.onChangeEnd?.({ value: ctx.value })
        },
        invokeOnChange(ctx) {
          ctx.onChange?.({ value: ctx.value })
        },
        dispatchChangeEvent(ctx) {
          dom.dispatchChangeEvent(ctx)
        },
        setPointerValue(ctx, evt) {
          const value = dom.getValueFromPoint(ctx, evt.point)
          if (value == null) return
          ctx.value = utils.clamp(ctx, value)
        },
        focusThumb(ctx) {
          raf(() => dom.getThumbEl(ctx)?.focus())
        },
        decrement(ctx, evt) {
          ctx.value = utils.decrement(ctx, evt.step)
        },
        increment(ctx, evt) {
          ctx.value = utils.increment(ctx, evt.step)
        },
        setToMin(ctx) {
          ctx.value = ctx.min
        },
        setToMax(ctx) {
          ctx.value = ctx.max
        },
        setValue(ctx, evt) {
          ctx.value = utils.convert(ctx, evt.value)
        },
      },
    },
  )
}
