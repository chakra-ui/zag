import { createMachine } from "@zag-js/core"
import { dispatchInputCheckedEvent, trackFormControl } from "@zag-js/form-utils"
import { compact } from "@zag-js/utils"
import { dom } from "./checkbox.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./checkbox.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "checkbox",
      initial: ctx.checked ? "checked" : "unchecked",

      context: {
        active: false,
        hovered: false,
        focused: false,
        disabled: false,
        readOnly: false,
        ...ctx,
      },

      watch: {
        indeterminate: "syncInputIndeterminate",
        disabled: "removeFocusIfNeeded",
        checked: ["toggleChecked", "invokeOnChange"],
      },

      computed: {
        isInteractive: (ctx) => !(ctx.readOnly || ctx.disabled),
      },

      activities: ["trackFormControlState"],

      on: {
        SET_STATE: [
          {
            guard: "shouldCheck",
            target: "checked",
            actions: ["invokeOnChange", "dispatchChangeEvent"],
          },
          {
            target: "unchecked",
            actions: ["invokeOnChange", "dispatchChangeEvent"],
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
        trackFormControlState(ctx, _evt, { send, initialContext }) {
          return trackFormControl(dom.getInputEl(ctx), {
            onFieldsetDisabled() {
              ctx.disabled = true
            },
            onFormReset() {
              send({ type: "SET_STATE", checked: !!initialContext.checked })
            },
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
        toggleChecked(ctx, _evt, { send }) {
          send({ type: "SET_STATE", checked: ctx.checked, controlled: true })
        },
      },
    },
  )
}
