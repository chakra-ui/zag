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
        checked: "syncInputElement",
      },

      activities: ["trackFormControlState"],

      on: {
        "CHECKED.TOGGLE": {
          actions: ["toggleChecked"],
        },
        "CHECKED.SET": {
          actions: ["setChecked"],
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
      activities: {
        trackFormControlState(ctx, _evt, { send, initialContext }) {
          return trackFormControl(dom.getHiddenInputEl(ctx), {
            onFieldsetDisabled() {
              ctx.disabled = true
            },
            onFormReset() {
              send({ type: "CHECKED.SET", checked: !!initialContext.checked, src: "form-reset" })
            },
          })
        },
      },

      actions: {
        setContext(ctx, evt) {
          Object.assign(ctx, evt.context)
        },
        syncInputElement(ctx) {
          const inputEl = dom.getHiddenInputEl(ctx)
          if (!inputEl) return
          inputEl.checked = !!ctx.checked
        },
        removeFocusIfNeeded(ctx) {
          if (ctx.disabled && ctx.focused) {
            ctx.focused = false
          }
        },
        setChecked(ctx, evt) {
          set.checked(ctx, evt.checked)
        },
        toggleChecked(ctx, _evt) {
          set.checked(ctx, !ctx.checked)
        },
      },
    },
  )
}

const invoke = {
  change: (ctx: MachineContext) => {
    // invoke fn
    ctx.onChange?.({ checked: ctx.checked })

    // form event
    const inputEl = dom.getHiddenInputEl(ctx)
    dispatchInputCheckedEvent(inputEl, { checked: ctx.checked, bubbles: true })
  },
}

const set = {
  checked: (ctx: MachineContext, checked: boolean) => {
    ctx.checked = checked
    invoke.change(ctx)
  },
}
