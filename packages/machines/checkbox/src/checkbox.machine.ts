import { createMachine, guards } from "@zag-js/core"
import { trackFocusVisible, trackPress } from "@zag-js/dom-event"
import { dispatchInputCheckedEvent, setElementChecked, trackFormControl } from "@zag-js/form-utils"
import { compact, isEqual } from "@zag-js/utils"
import { dom } from "./checkbox.dom"
import type { CheckedState, MachineContext, MachineState, UserDefinedContext } from "./checkbox.types"

const { not } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "checkbox",
      initial: "ready",

      context: {
        checked: false,
        value: "on",
        disabled: false,
        ...ctx,
        fieldsetDisabled: false,
      },

      watch: {
        disabled: "removeFocusIfNeeded",
        checked: "syncInputElement",
      },

      activities: ["trackFormControlState", "trackPressEvent", "trackFocusVisible"],

      on: {
        "CHECKED.TOGGLE": [
          {
            guard: not("isTrusted"),
            actions: ["toggleChecked", "dispatchChangeEvent"],
          },
          {
            actions: ["toggleChecked"],
          },
        ],
        "CHECKED.SET": [
          {
            guard: not("isTrusted"),
            actions: ["setChecked", "dispatchChangeEvent"],
          },
          {
            actions: ["setChecked"],
          },
        ],
        "CONTEXT.SET": {
          actions: ["setContext"],
        },
      },

      computed: {
        isIndeterminate: (ctx) => isIndeterminate(ctx.checked),
        isChecked: (ctx) => isChecked(ctx.checked),
        isDisabled: (ctx) => !!ctx.disabled || ctx.fieldsetDisabled,
      },

      states: {
        ready: {},
      },
    },
    {
      guards: {
        isTrusted: (_ctx, evt) => !!evt.isTrusted,
      },
      activities: {
        trackPressEvent(ctx) {
          if (ctx.isDisabled) return
          return trackPress({
            pointerNode: dom.getRootEl(ctx),
            keyboardNode: dom.getHiddenInputEl(ctx),
            isValidKey: (event) => event.key === " ",
            onPress: () => (ctx.active = false),
            onPressStart: () => (ctx.active = true),
            onPressEnd: () => (ctx.active = false),
          })
        },
        trackFocusVisible(ctx) {
          if (ctx.isDisabled) return
          return trackFocusVisible(dom.getHiddenInputEl(ctx), {
            onFocus: () => (ctx.focused = true),
            onBlur: () => (ctx.focused = false),
          })
        },
        trackFormControlState(ctx, _evt, { send, initialContext }) {
          return trackFormControl(dom.getHiddenInputEl(ctx), {
            onFieldsetDisabledChange(disabled) {
              ctx.fieldsetDisabled = disabled
            },
            onFormReset() {
              send({ type: "CHECKED.SET", checked: !!initialContext.checked })
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
          setElementChecked(inputEl, ctx.isChecked)
          inputEl.indeterminate = ctx.isIndeterminate
        },
        removeFocusIfNeeded(ctx) {
          if (ctx.disabled && ctx.focused) {
            ctx.focused = false
          }
        },
        setChecked(ctx, evt) {
          set.checked(ctx, evt.checked)
        },
        toggleChecked(ctx) {
          const checked = isIndeterminate(ctx.checked) ? true : !ctx.checked
          set.checked(ctx, checked)
        },
        dispatchChangeEvent(ctx) {
          const inputEl = dom.getHiddenInputEl(ctx)
          dispatchInputCheckedEvent(inputEl, { checked: isChecked(ctx.checked) })
        },
      },
    },
  )
}

function isIndeterminate(checked?: CheckedState): checked is "indeterminate" {
  return checked === "indeterminate"
}

function isChecked(checked?: CheckedState): checked is boolean {
  return isIndeterminate(checked) ? false : !!checked
}

const invoke = {
  change: (ctx: MachineContext) => {
    ctx.onCheckedChange?.({ checked: ctx.checked })
  },
}

const set = {
  checked: (ctx: MachineContext, checked: CheckedState) => {
    if (isEqual(ctx.checked, checked)) return
    ctx.checked = checked
    invoke.change(ctx)
  },
}
