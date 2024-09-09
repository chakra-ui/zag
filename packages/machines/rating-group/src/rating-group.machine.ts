import { createMachine } from "@zag-js/core"
import { raf } from "@zag-js/dom-query"
import { trackFormControl } from "@zag-js/form-utils"
import { compact, isEqual } from "@zag-js/utils"
import { dom } from "./rating-group.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./rating-group.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "rating",
      initial: "idle",
      context: {
        name: "rating",
        count: 5,
        dir: "ltr",
        value: -1,
        readOnly: false,
        disabled: false,
        ...ctx,
        hoveredValue: -1,
        fieldsetDisabled: false,
        translations: {
          ratingValueText: (index) => `${index} stars`,
          ...ctx.translations,
        },
      },

      created: ["roundValueIfNeeded"],

      watch: {
        allowHalf: ["roundValueIfNeeded"],
      },

      computed: {
        isDisabled: (ctx) => !!ctx.disabled || ctx.fieldsetDisabled,
        isInteractive: (ctx) => !(ctx.isDisabled || ctx.readOnly),
        isHovering: (ctx) => ctx.hoveredValue > -1,
      },

      activities: ["trackFormControlState"],

      on: {
        SET_VALUE: {
          actions: ["setValue"],
        },
        CLEAR_VALUE: {
          actions: ["clearValue"],
        },
      },

      states: {
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
        isRadioFocused: (ctx) => !!dom.getControlEl(ctx)?.contains(dom.getActiveElement(ctx)),
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
      },
      actions: {
        clearHoveredValue(ctx) {
          set.hoveredValue(ctx, -1)
        },
        focusActiveRadio(ctx) {
          raf(() => dom.getRadioEl(ctx)?.focus())
        },
        setPrevValue(ctx) {
          const factor = ctx.allowHalf ? 0.5 : 1
          set.value(ctx, Math.max(0, ctx.value - factor))
        },
        setNextValue(ctx) {
          const factor = ctx.allowHalf ? 0.5 : 1
          const value = ctx.value === -1 ? 0 : ctx.value
          set.value(ctx, Math.min(ctx.count, value + factor))
        },
        setValueToMin(ctx) {
          set.value(ctx, 1)
        },
        setValueToMax(ctx) {
          set.value(ctx, ctx.count)
        },
        setValue(ctx, evt) {
          const value = ctx.hoveredValue === -1 ? evt.value : ctx.hoveredValue
          set.value(ctx, value)
        },
        clearValue(ctx) {
          set.value(ctx, -1)
        },
        setHoveredValue(ctx, evt) {
          const half = ctx.allowHalf && evt.isMidway
          const factor = half ? 0.5 : 0
          set.hoveredValue(ctx, evt.index - factor)
        },
        roundValueIfNeeded(ctx) {
          if (ctx.allowHalf) return
          // doesn't use set.value(...) because it's an implicit coarsing (used in watch and created)
          ctx.value = Math.round(ctx.value)
        },
      },
    },
  )
}

const invoke = {
  change: (ctx: MachineContext) => {
    ctx.onValueChange?.({ value: ctx.value })
    dom.dispatchChangeEvent(ctx)
  },
  hoverChange: (ctx: MachineContext) => {
    ctx.onHoverChange?.({ hoveredValue: ctx.hoveredValue })
  },
}

const set = {
  value: (ctx: MachineContext, value: number) => {
    if (isEqual(ctx.value, value)) return
    ctx.value = value
    invoke.change(ctx)
  },
  hoveredValue: (ctx: MachineContext, value: number) => {
    if (isEqual(ctx.hoveredValue, value)) return
    ctx.hoveredValue = value
    invoke.hoverChange(ctx)
  },
}
