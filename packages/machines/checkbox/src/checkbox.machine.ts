import { createMachine } from "@zag-js/core"
import { dispatchInputCheckedEvent, trackFormControl } from "@zag-js/form-utils"
import { compact } from "@zag-js/utils"
import { dom } from "./checkbox.dom"
import type { CheckedState, MachineContext, MachineState, UserDefinedContext } from "./checkbox.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "checkbox",
      initial: "ready",

      context: {
        checked: false,
        value: "on",
        ...ctx,
      },

      watch: {
        disabled: "removeFocusIfNeeded",
        checked: ["invokeOnChange", "syncInputElement"],
      },

      activities: ["trackFormControlState"],

      on: {
        "CHECKED.TOGGLE": {
          actions: ["toggleChecked"],
        },
        "CHECKED.SET": {
          actions: ["setChecked"],
        },
        "DISPATCH.CHANGE": {
          actions: ["dispatchChangeEvent"],
        },
        "CONTEXT.SET": {
          actions: ["setContext"],
        },
      },

      computed: {
        isIndeterminate: (ctx) => isIndeterminate(ctx.checked),
        isChecked: (ctx) => (ctx.isIndeterminate ? false : !!ctx.checked),
      },

      states: {
        ready: {},
      },
    },
    {
      activities: {
        trackFormControlState(ctx, _evt, { send, initialContext }) {
          return trackFormControl(dom.getInputEl(ctx), {
            onFieldsetDisabled() {
              ctx.disabled = true
            },
            onFormReset() {
              send({ type: "CHECKED.SET", checked: !!initialContext.checked })
            },
          })
        },
      },

      actions: {
        invokeOnChange(ctx) {
          ctx.onChange?.({ checked: ctx.checked })
        },
        setContext(ctx, evt) {
          Object.assign(ctx, evt.context)
        },
        syncInputIndeterminate(ctx) {
          const inputEl = dom.getInputEl(ctx)
          inputEl.indeterminate = ctx.isIndeterminate
        },
        syncInputElement(ctx) {
          const inputEl = dom.getInputEl(ctx)
          inputEl.checked = !!ctx.checked
        },
        dispatchChangeEvent(ctx, evt) {
          const inputEl = dom.getInputEl(ctx)
          const checked = isIndeterminate(evt.checked) ? false : evt.checked
          dispatchInputCheckedEvent(inputEl, checked)
        },
        removeFocusIfNeeded(ctx) {
          if (ctx.disabled && ctx.focused) {
            ctx.focused = false
          }
        },
        setChecked(ctx, evt) {
          ctx.checked = evt.checked
        },
        toggleChecked(ctx) {
          ctx.checked = isIndeterminate(ctx.checked) ? true : !ctx.checked
        },
      },
    },
  )
}

function isIndeterminate(checked?: CheckedState): checked is "indeterminate" {
  return checked === "indeterminate"
}
