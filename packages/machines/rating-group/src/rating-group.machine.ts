import { createMachine } from "@zag-js/core"
import { raf } from "@zag-js/dom-utils"
import { trackFormControl } from "@zag-js/form-utils"
import { compact } from "@zag-js/utils"
import { dom } from "./rating-group.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./rating-group.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "rating",
      initial: "unknown",
      context: {
        name: "rating",
        max: 5,
        dir: "ltr",
        value: -1,
        initialValue: -1,
        hoveredValue: -1,
        disabled: false,
        readOnly: false,
        ...ctx,
        translations: {
          ratingValueText: (index) => `${index} stars`,
          ...ctx.translations,
        },
      },

      created: ["roundValueIfNeeded"],

      watch: {
        allowHalf: ["roundValueIfNeeded"],
        value: ["invokeOnChange", "dispatchChangeEvent"],
      },

      computed: {
        isInteractive: (ctx) => !(ctx.disabled || ctx.readOnly),
        isHovering: (ctx) => ctx.hoveredValue > -1,
      },

      activities: ["trackFormControlState"],

      states: {
        unknown: {
          on: {
            SETUP: {
              target: "idle",
              actions: "checkValue",
            },
          },
        },

        idle: {
          entry: "clearHoveredValue",
          on: {
            GROUP_POINTER_OVER: "hover",
            FOCUS: "focus",
            CLICK: {
              actions: ["setValue", "focusActiveRadio"],
            },
          },
        },

        focus: {
          on: {
            POINTER_OVER: {
              actions: "setHoveredValue",
            },
            GROUP_POINTER_LEAVE: {
              actions: "clearHoveredValue",
            },
            BLUR: "idle",
            SPACE: {
              guard: "isValueEmpty",
              actions: ["setValue"],
            },
            CLICK: {
              actions: ["setValue", "focusActiveRadio"],
            },
            ARROW_LEFT: {
              actions: ["setPrevValue", "focusActiveRadio"],
            },
            ARROW_RIGHT: {
              actions: ["setNextValue", "focusActiveRadio"],
            },
            HOME: {
              actions: ["setValueToMin", "focusActiveRadio"],
            },
            END: {
              actions: ["setValueToMax", "focusActiveRadio"],
            },
          },
        },

        hover: {
          on: {
            POINTER_OVER: {
              actions: "setHoveredValue",
            },
            GROUP_POINTER_LEAVE: [
              {
                guard: "isRadioFocused",
                target: "focus",
                actions: "clearHoveredValue",
              },
              {
                target: "idle",
                actions: "clearHoveredValue",
              },
            ],
            CLICK: {
              actions: ["setValue", "focusActiveRadio"],
            },
          },
        },
      },
    },
    {
      guards: {
        isInteractive: (ctx) => !(ctx.disabled || ctx.readOnly),
        isHoveredValueEmpty: (ctx) => ctx.hoveredValue === -1,
        isValueEmpty: (ctx) => ctx.value <= 0,
        isRadioFocused: (ctx) => !!dom.getControlsEl(ctx)?.contains(dom.getActiveEl(ctx)),
      },
      activities: {
        trackFormControlState(ctx) {
          return trackFormControl(dom.getHiddenInputEl(ctx), {
            onFieldsetDisabled() {
              ctx.disabled = true
            },
            onFormReset() {
              ctx.value = ctx.initialValue
            },
          })
        },
      },
      actions: {
        checkValue(ctx) {
          ctx.initialValue = ctx.value
        },

        clearHoveredValue(ctx) {
          ctx.hoveredValue = -1
        },
        focusActiveRadio(ctx) {
          raf(() => dom.getRadioEl(ctx)?.focus())
        },
        setPrevValue(ctx) {
          const factor = ctx.allowHalf ? 0.5 : 1
          ctx.value = Math.max(0, ctx.value - factor)
        },
        setNextValue(ctx) {
          const factor = ctx.allowHalf ? 0.5 : 1
          const value = ctx.value === -1 ? 0 : ctx.value
          ctx.value = Math.min(ctx.max, value + factor)
        },
        setValueToMin(ctx) {
          ctx.value = 1
        },
        setValueToMax(ctx) {
          ctx.value = ctx.max
        },
        setValue(ctx, evt) {
          ctx.value = ctx.hoveredValue === -1 ? evt.value : ctx.hoveredValue
        },
        setHoveredValue(ctx, evt) {
          const half = ctx.allowHalf && evt.isMidway
          let factor = half ? 0.5 : 0
          if (ctx.dir === "rtl") {
            factor = half ? 0 : 0.5
          }
          let value = evt.index - factor
          ctx.hoveredValue = value
        },
        dispatchChangeEvent(ctx, evt) {
          if (evt.type !== "SETUP") {
            dom.dispatchChangeEvent(ctx)
          }
        },
        invokeOnChange(ctx, evt) {
          if (evt.type !== "SETUP") {
            ctx.onChange?.({ value: ctx.value })
          }
        },
        invokeOnHover(ctx) {
          ctx.onHover?.({ value: ctx.hoveredValue })
        },
        roundValueIfNeeded(ctx) {
          if (!ctx.allowHalf) {
            ctx.value = Math.round(ctx.value)
          }
        },
      },
    },
  )
}
