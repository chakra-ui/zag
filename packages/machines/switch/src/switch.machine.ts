import { createMachine, guards } from "@zag-js/core"
import { trackFocusVisible, trackPress } from "@zag-js/dom-event"
import { dispatchInputCheckedEvent, trackFormControl } from "@zag-js/form-utils"
import { compact, isEqual } from "@zag-js/utils"
import { dom } from "./switch.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./switch.types"

const { not } = guards

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
        disabled: false,
        ...ctx,
        fieldsetDisabled: false,
      },

      computed: {
        isDisabled: (ctx) => ctx.disabled || ctx.fieldsetDisabled,
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
        dispatchChangeEvent(ctx) {
          const inputEl = dom.getHiddenInputEl(ctx)
          dispatchInputCheckedEvent(inputEl, { checked: ctx.checked })
        },
      },
    },
  )
}

const invoke = {
  change: (ctx: MachineContext) => {
    ctx.onCheckedChange?.({ checked: ctx.checked })
  },
}

const set = {
  checked: (ctx: MachineContext, checked: boolean) => {
    if (isEqual(ctx.checked, checked)) return
    ctx.checked = checked
    invoke.change(ctx)
  },
}
