import { createMachine, guards } from "@zag-js/core"
import { dispatchInputCheckedEvent, trackFieldsetDisabled, trackFormReset } from "@zag-js/form-utils"
import { compact } from "@zag-js/utils"
import { dom } from "./checkbox.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./checkbox.types"

const { and } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "checkbox",
      initial: ctx.defaultChecked ? "checked" : "unchecked",

      context: {
        active: false,
        hovered: false,
        focused: false,
        disabled: false,
        readonly: false,
        ...ctx,
      },

      watch: {
        indeterminate: "syncInputIndeterminate",
        disabled: "removeFocusIfNeeded",
      },

      computed: {
        isInteractive: (ctx) => !(ctx.readonly || ctx.disabled),
      },

      activities: ["trackFormReset", "trackFieldsetDisabled"],

      on: {
        SET_STATE: [
          {
            guard: and("shouldCheck", "isInteractive"),
            target: "checked",
            actions: "dispatchChangeEvent",
          },
          {
            guard: "isInteractive",
            target: "unchecked",
            actions: "dispatchChangeEvent",
          },
        ],

        SET_ACTIVE: {
          actions: "setActive",
        },
        SET_HOVERED: {
          actions: "setHovered",
        },
        SET_FOCUSED: {
          actions: "setFocused",
        },
        SET_INDETERMINATE: {
          actions: "setIndeterminate",
        },
      },

      states: {
        checked: {
          on: {
            TOGGLE: {
              target: "unchecked",
              guard: "isInteractive",
              actions: ["invokeOnChange"],
            },
          },
        },
        unchecked: {
          on: {
            TOGGLE: {
              target: "checked",
              guard: "isInteractive",
              actions: ["invokeOnChange"],
            },
          },
        },
      },
    },
    {
      guards: {
        shouldCheck: (_, evt) => evt.checked,
        isInteractive: (ctx) => ctx.isInteractive,
      },

      activities: {
        trackFieldsetDisabled(ctx) {
          return trackFieldsetDisabled(dom.getRootEl(ctx), (disabled) => {
            if (disabled) {
              ctx.disabled = disabled
            }
          })
        },
        trackFormReset(ctx, _evt, { send }) {
          return trackFormReset(dom.getInputEl(ctx), () => {
            send({ type: "SET_STATE", checked: !!ctx.defaultChecked })
          })
        },
      },

      actions: {
        invokeOnChange(ctx, _evt, { state }) {
          const checked = state.matches("checked")
          ctx.onChange?.({ checked: ctx.indeterminate ? "indeterminate" : checked })
        },
        setActive(ctx, evt) {
          ctx.active = evt.value
        },
        setHovered(ctx, evt) {
          ctx.hovered = evt.value
        },
        setFocused(ctx, evt) {
          ctx.focused = evt.value
        },
        setIndeterminate(ctx, evt) {
          ctx.indeterminate = evt.value
        },
        syncInputIndeterminate(ctx) {
          const el = dom.getInputEl(ctx)
          if (!el) return
          el.indeterminate = Boolean(ctx.indeterminate)
        },
        dispatchChangeEvent(ctx, evt) {
          if (!evt.manual) return
          const el = dom.getInputEl(ctx)
          if (!el) return
          dispatchInputCheckedEvent(el, evt.checked)
        },
        removeFocusIfNeeded(ctx) {
          if (ctx.disabled && ctx.focused) {
            ctx.focused = false
          }
        },
      },
    },
  )
}
