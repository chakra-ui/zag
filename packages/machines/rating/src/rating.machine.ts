import { createMachine, ref } from "@zag-js/core"
import { nextTick } from "@zag-js/dom-utils"
import { MachineContext, MachineState } from "./rating.types"
import { dom } from "./rating.dom"

export const machine = createMachine<MachineContext, MachineState>(
  {
    id: "rating",
    initial: "unknown",
    context: {
      name: "rating",
      max: 5,
      dir: "ltr",
      uid: "",
      value: -1,
      initialValue: -1,
      hoveredValue: -1,
      disabled: false,
      readonly: false,
      messages: {
        ratingValueText: (index) => `${index} stars`,
      },
    },

    created: ["roundValueIfNeeded"],

    watch: {
      allowHalf: ["roundValueIfNeeded"],
      value: ["invokeOnChange", "dispatchChangeEvent"],
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
            actions: ["setupDocument", "checkValue"],
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
      isInteractive: (ctx) => !(ctx.disabled || ctx.readonly),
      isHoveredValueEmpty: (ctx) => ctx.hoveredValue === -1,
      isValueEmpty: (ctx) => ctx.value <= 0,
      isRadioFocused: (ctx) => !!dom.getItemGroupEl(ctx)?.contains(dom.getActiveEl(ctx)),
    },
    actions: {
      checkValue(ctx) {
        ctx.initialValue = ctx.value
      },
      setupDocument(ctx, evt) {
        if (evt.doc) ctx.doc = ref(evt.doc)
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
