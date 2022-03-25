import { createMachine, ref } from "@ui-machines/core"
import { ToggleMachineContext, ToggleMachineState } from "./toggle.types"

export const machine = createMachine<ToggleMachineContext, ToggleMachineState>(
  {
    id: "toggle-machine",
    initial: "unknown",
    context: {
      uid: "",
      disabled: false,
      label: "Toggle",
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
        ctx.onChange?.(evt.pressed)
      },
    },
  },
)
