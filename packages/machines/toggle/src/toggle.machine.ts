import { createMachine } from "@zag-js/core"
import type { MachineContext, MachineState, UserDefinedContext } from "./toggle.types"

export function machine(ctx: UserDefinedContext) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "toggle",
      initial: "unknown",

      context: {
        disabled: false,
        label: "toggle",
        ...ctx,
      },

      on: {
        SET_DISABLED: {
          actions: "setDisabled",
        },
        SET_STATE: [
          { guard: "isPressed", target: "pressed", actions: ["invokeOnChange"] },
          { target: "unpressed", actions: ["invokeOnChange"] },
        ],
      },

      states: {
        unknown: {
          on: {
            SETUP: ctx.defaultPressed ? "pressed" : "unpressed",
          },
        },
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
        setDisabled(ctx, evt) {
          ctx.disabled = evt.disabled
        },
      },
    },
  )
}
