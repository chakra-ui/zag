import { createMachine, ref } from "@ui-machines/core"
import { ToggleMachineContext, ToggleMachineState } from "./toggle.types"

export const machine = createMachine<ToggleMachineContext, ToggleMachineState>(
  {
    id: "toggle-machine",
    initial: "unknown",
    context: {
      uid: "",
      disabled: false,
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
        ctx.doc = ref(evt.doc)
      },
    },
  },
)
