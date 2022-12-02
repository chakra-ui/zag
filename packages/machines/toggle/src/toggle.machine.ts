import { createMachine } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./toggle.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "toggle",
      initial: ctx.defaultPressed ? "pressed" : "unpressed",

      context: {
        disabled: false,
        label: "toggle",
        ...ctx,
      },

      on: {
        SET_STATE: [
          { guard: "isPressed", target: "pressed", actions: ["invokeOnChange"] },
          { target: "unpressed", actions: ["invokeOnChange"] },
        ],
      },

      states: {
        pressed: {
          on: { TOGGLE: "unpressed" },
        },
        unpressed: {
          on: { TOGGLE: "pressed" },
        },
      },
    },
    {
      guards: {
        isPressed: (_ctx, evt) => evt.pressed,
      },
      actions: {
        invokeOnChange(ctx, evt) {
          ctx.onChange?.({ pressed: evt.pressed })
        },
      },
    },
  )
}
