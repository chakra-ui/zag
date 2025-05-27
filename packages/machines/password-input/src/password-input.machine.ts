import { createMachine } from "@zag-js/core"
import type { PasswordInputSchema } from "./password-input.types"
import * as dom from "./password-input.dom"
import { uuid } from "@zag-js/utils"

export const machine = createMachine<PasswordInputSchema>({
  props({ props }) {
    return {
      id: uuid(),
      defaultVisible: false,
      autoComplete: "current-password",
      ignorePasswordManagers: false,
      ...props,
      translations: {
        visibilityTrigger(visible) {
          return visible ? "Hide password" : "Show password"
        },
        ...props.translations,
      },
    }
  },

  context({ prop, bindable }) {
    return {
      visible: bindable(() => ({
        value: prop("visible"),
        defaultValue: prop("defaultVisible"),
        onChange(value) {
          prop("onVisibilityChange")?.({ visible: value })
        },
      })),
    }
  },

  initialState() {
    return "idle"
  },

  effects: ["trackFormEvents"],

  states: {
    idle: {
      on: {
        "VISIBILITY.SET": {
          actions: ["setVisibility"],
        },
        "TRIGGER.CLICK": {
          actions: ["toggleVisibility", "focusInputEl"],
        },
      },
    },
  },

  implementations: {
    actions: {
      setVisibility({ context, event }) {
        context.set("visible", event.value)
      },
      toggleVisibility({ context }) {
        context.set("visible", (c) => !c)
      },
      focusInputEl({ scope }) {
        const inputEl = dom.getInputEl(scope)
        inputEl?.focus()
      },
    },

    effects: {
      trackFormEvents({ scope, send }) {
        const inputEl = dom.getInputEl(scope)
        const form = inputEl?.form
        if (!form) return

        const win = scope.getWin()
        const controller = new win.AbortController()

        form.addEventListener(
          "reset",
          (event) => {
            if (event.defaultPrevented) return
            send({ type: "VISIBILITY.SET", value: false })
          },
          { signal: controller.signal },
        )

        form.addEventListener(
          "submit",
          () => {
            send({ type: "VISIBILITY.SET", value: false })
          },
          { signal: controller.signal },
        )

        return () => controller.abort()
      },
    },
  },
})
