import { createMachine, ref } from "@zag-js/core"
import type { MachineContext, MachineState, UserDefinedContext } from "./toggle.types"

export function machine(ctx: UserDefinedContext = {}) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "toggle-machine",
      initial: "unknown",
      context: {
        uid: "",
        disabled: false,
        label: "toggle",
        ...ctx,
      },
      states: {
        unknown: {
          on: {
            SETUP: { target: "unpressed", actions: "setupDocument" },
          },
        },
        pressed: {
          on: { CLICK: "unpressed" },
        },
        unpressed: {
          on: { CLICK: "pressed" },
        },
      },
    },
    {
      actions: {
        setupDocument(ctx, evt) {
          ctx.uid = evt.id
          if (evt.doc) ctx.doc = ref(evt.doc)
        },
        invokeOnChange(ctx, evt) {
          ctx.onChange?.({ pressed: evt.pressed })
        },
      },
    },
  )
}
