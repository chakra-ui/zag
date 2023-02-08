import { createMachine } from "@zag-js/core"
import { dispatchInputCheckedEvent, trackFormControl } from "@zag-js/form-utils"
import { compact } from "@zag-js/utils"
import { dom } from "./radio-group.dom"
import { MachineContext, MachineState, UserDefinedContext } from "./radio-group.types"

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

      watch: {
        value: ["dispatchChangeEvent", "invokeOnChange", "syncInputElements"],
      },

      entry: ["checkValue"],

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
      },
    },
  )
}
