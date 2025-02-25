import { createMachine } from "@zag-js/core"
import type { ToggleSchema } from "./toggle.types"

export const machine = createMachine<ToggleSchema>({
  props({ props }) {
    return {
      defaultPressed: false,
      ...props,
    }
  },

  context({ prop, bindable }) {
    return {
      pressed: bindable<boolean>(() => ({
        value: prop("pressed"),
        defaultValue: prop("defaultPressed"),
        onChange(value) {
          prop("onPressedChange")?.(value)
        },
      })),
    }
  },

  initialState() {
    return "idle"
  },

  on: {
    "PRESS.TOGGLE": {
      actions: ["togglePressed"],
    },
    "PRESS.SET": {
      actions: ["setPressed"],
    },
  },

  states: {
    idle: {},
  },

  implementations: {
    actions: {
      togglePressed({ context }) {
        context.set("pressed", !context.get("pressed"))
      },
      setPressed({ context, event }) {
        context.set("pressed", event.value)
      },
    },
  },
})
