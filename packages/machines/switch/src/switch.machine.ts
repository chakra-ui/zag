import { createMachine } from "@zag-js/core"
import { dispatchInputCheckedEvent, trackFormControl } from "@zag-js/form-utils"
import { compact } from "@zag-js/utils"
import { dom } from "./switch.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./switch.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "switch",
      initial: "ready",

      context: {
        checked: false,
        label: "switch",
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
          actions: ["dispatchChangeEvent"],
        },
        "CONTEXT.SET": {
          actions: ["setContext"],
        },
      },

      states: {
        ready: {},
      },
    },
    {
      guards: {
        shouldCheck: (_, evt) => evt.checked,
      },

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
        syncInputElement(ctx) {
          const inputEl = dom.getInputEl(ctx)
          inputEl.checked = !!ctx.checked
        },
        dispatchChangeEvent(ctx, evt) {
          const inputEl = dom.getInputEl(ctx)
          const checked = evt.checked
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
        toggleChecked(ctx, _evt) {
          ctx.checked = !ctx.checked
        },
      },
    },
  )
}
