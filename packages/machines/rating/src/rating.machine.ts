import { createMachine, ref } from "@ui-machines/core"
import { nextTick } from "@ui-machines/dom-utils"
import { MachineContext, MachineState } from "./rating.types"
import { dom } from "./rating.dom"

export const machine = createMachine<MachineContext, MachineState>(
  {
    id: "rating-machine",
    initial: "unknown",
    context: {
      name: "rating",
      max: 5,
      uid: "rating-input",
      value: -1,
      hoveredValue: -1,
      disabled: false,
      readonly: false,
    },
    computed: {
      isInteractive: (ctx) => !(ctx.disabled || ctx.readonly),
      isHovering: (ctx) => ctx.hoveredValue > -1,
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
        entry: "clearHoveredValue",
        on: {
          GROUP_POINTER_OVER: "hover",
          FOCUS: "focus",
        },
      },

      focus: {
        on: {
          POINTER_OVER: { actions: "setHoveredValue" },
          GROUP_POINTER_LEAVE: { actions: "clearHoveredValue" },
          BLUR: "idle",
          SPACE: {
            guard: "isValueEmpty",
            actions: ["setValue", "invokeOnChange"],
          },
          CLICK: {
            actions: ["setValue", "invokeOnChange", "focusActiveRadio"],
          },
          ARROW_LEFT: {
            actions: ["setPrevValue", "invokeOnChange", "focusActiveRadio"],
          },
          ARROW_RIGHT: {
            actions: ["setNextValue", "invokeOnChange", "focusActiveRadio"],
          },
          HOME: {
            actions: ["setValueToMin", "invokeOnChange", "focusActiveRadio"],
          },
          END: {
            actions: ["setValueToMax", "invokeOnChange", "focusActiveRadio"],
          },
        },
      },

      hover: {
        on: {
          POINTER_OVER: { actions: "setHoveredValue" },
          GROUP_POINTER_LEAVE: [
            {
              guard: "isRadioFocused",
              target: "focus",
            },
            { target: "idle" },
          ],
          CLICK: {
            actions: ["setValue", "invokeOnChange", "focusActiveRadio"],
          },
        },
      },
    },
  },
  {
    guards: {
      isInteractive: (ctx) => !(ctx.disabled || ctx.readonly),
      isHoveredValueEmpty: (ctx) => ctx.hoveredValue === -1,
      isValueEmpty: (ctx) => ctx.value <= 0,
      isRadioFocused: (ctx) => !!dom.getRootEl(ctx)?.contains(dom.getActiveEl(ctx)),
    },
    actions: {
      setupDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
        ctx.uid = evt.id
      },
      clearHoveredValue(ctx) {
        ctx.hoveredValue = -1
      },
      focusActiveRadio(ctx) {
        nextTick(() => dom.getRadioEl(ctx)?.focus())
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
        ctx.value = evt.value ?? ctx.hoveredValue
      },
      setHoveredValue(ctx, evt) {
        const factor = ctx.allowHalf && evt.isMidway ? 0.5 : 0
        ctx.hoveredValue = evt.index - factor
      },
      invokeOnChange(ctx) {
        ctx.onChange?.(ctx.value)
        dom.dispatchChangeEvent(ctx)
      },
    },
  },
)
