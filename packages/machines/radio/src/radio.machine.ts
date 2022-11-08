import { createMachine } from "@zag-js/core"
import { dispatchInputCheckedEvent, trackFieldsetDisabled, trackFormReset } from "@zag-js/form-utils"
import { compact } from "@zag-js/utils"
import { dom } from "./radio.dom"
import { MachineContext, MachineState, UserDefinedContext } from "./radio.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "radio",
      initial: "unknown",
      context: {
        value: null,
        initialValue: null,
        activeId: null,
        focusedId: null,
        hoveredId: null,
        ...ctx,
      },

      activities: ["trackFormReset", "trackFieldsetDisabled"],

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
        value: ["dispatchChangeEvent", "invokeOnChange"],
      },

      states: {
        unknown: {
          on: {
            SETUP: {
              actions: "checkValue",
            },
          },
        },
      },
    },

    {
      activities: {
        trackFieldsetDisabled(ctx) {
          return trackFieldsetDisabled(dom.getRootEl(ctx), (disabled) => {
            if (disabled) {
              ctx.disabled = disabled
            }
          })
        },
        trackFormReset(ctx, _evt, { send }) {
          return trackFormReset(dom.getRootEl(ctx), () => {
            send({ type: "SET_VALUE", value: ctx.initialValue })
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
          const el = dom.getItemInputEl(ctx, evt.value)
          if (!el) return
          dispatchInputCheckedEvent(el, !!evt.value)
        },
      },
    },
  )
}
