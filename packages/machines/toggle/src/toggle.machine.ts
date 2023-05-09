import { createMachine } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./toggle.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "toggle",
      initial: "ready",
      context: {
        "aria-label": "Toggle",
        disabled: false,
        pressed: false,
        ...ctx,
      },
      watch: {
        pressed: ["invokeOnChange"],
      },
      on: {
        "PRESSED.SET": {
          actions: ["setPressed"],
        },
        "PRESSED.TOGGLE": {
          actions: ["togglePressed"],
        },
      },
      states: {
        ready: {},
      },
    },
    {
      actions: {
        invokeOnChange(ctx) {
          ctx.onChange?.({ pressed: !!ctx.pressed })
        },
        togglePressed(ctx) {
          ctx.pressed = !ctx.pressed
        },
        setPressed(ctx, evt) {
          ctx.pressed = evt.pressed
        },
      },
    },
  )
}
