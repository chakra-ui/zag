import { createMachine } from "@zag-js/core"
import { dispatchInputCheckedEvent, trackFormControl } from "@zag-js/form-utils"
import { compact } from "@zag-js/utils"
import { dom } from "./radio-group.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./radio-group.types"
import { nextTick } from "@zag-js/dom-query"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "radio",
      initial: "idle",
      context: {
        value: null,
        initialValue: null,
        activeId: null,
        focusedId: null,
        hoveredId: null,
        indicatorRect: { left: "0px", top: "0px", width: "0px", height: "0px" },
        hasMeasuredRect: false,
        isIndicatorRendered: false,
        ...ctx,
      },

      activities: ["trackFormControlState"],

      on: {
        SET_VALUE: {
          actions: ["setValue"],
        },
        SET_HOVERED: {
          actions: "setHovered",
        },
        SET_ACTIVE: {
          actions: "setActive",
        },
        SET_FOCUSED: {
          actions: "setFocused",
        },
      },

      computed: {
        isHorizontal: (ctx) => ctx.orientation === "horizontal",
        isVertical: (ctx) => ctx.orientation === "vertical",
      },

      watch: {
        value: ["dispatchChangeEvent", "invokeOnChange", "syncInputElements", "setIndicatorRect"],
        dir: ["clearMeasured", "setIndicatorRect"],
      },

      entry: ["checkValue", "checkRenderedElements", "setIndicatorRect"],

      states: {
        idle: {},
      },
    },

    {
      activities: {
        trackFormControlState(ctx, _evt, { send }) {
          return trackFormControl(dom.getRootEl(ctx), {
            onFieldsetDisabled() {
              ctx.disabled = true
            },
            onFormReset() {
              send({ type: "SET_VALUE", value: ctx.initialValue })
            },
          })
        },
      },

      actions: {
        checkValue(ctx) {
          ctx.initialValue = ctx.value
        },
        setValue(ctx, evt) {
          ctx.value = evt.value
        },
        setHovered(ctx, evt) {
          ctx.hoveredId = evt.value
        },
        setActive(ctx, evt) {
          ctx.activeId = evt.value
        },
        setFocused(ctx, evt) {
          ctx.focusedId = evt.value
        },
        invokeOnChange(ctx, evt) {
          ctx.onChange?.({ value: evt.value })
        },
        dispatchChangeEvent(ctx, evt) {
          if (!evt.manual) return
          const el = dom.getRadioInputEl(ctx, evt.value)
          dispatchInputCheckedEvent(el, !!evt.value)
        },
        syncInputElements(ctx) {
          const inputs = dom.getInputEls(ctx)
          inputs.forEach((input) => {
            input.checked = input.value === ctx.value
          })
        },
        setIndicatorRect(ctx) {
          nextTick(() => {
            if (!ctx.isIndicatorRendered || !ctx.value) return
            ctx.indicatorRect = dom.getRectById(ctx, ctx.value)
            if (ctx.hasMeasuredRect) return
            nextTick(() => {
              ctx.hasMeasuredRect = true
            })
          })
        },
        checkRenderedElements(ctx) {
          ctx.isIndicatorRendered = !!dom.getIndicatorEl(ctx)
        },
        clearMeasured(ctx) {
          ctx.hasMeasuredRect = false
        },
      },
    },
  )
}
