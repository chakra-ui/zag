import { createMachine, ref } from "@zag-js/core"
import type { MachineContext, MachineState, UserDefinedContext } from "./toggle.types"

export function machine(ctx: UserDefinedContext = {}) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "toggle",
      initial: "unknown",

      context: {
        uid: "",
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
        unknown: {
          on: {
            SETUP: { target: "unpressed", actions: "setupDocument" },
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
        setupDocument(ctx, evt) {
          ctx.uid = evt.id
          if (evt.doc) ctx.doc = ref(evt.doc)
          if (evt.root) ctx.rootNode = ref(evt.root)
        },
        invokeOnChange(ctx, evt) {
          ctx.onChange?.({ pressed: evt.pressed })
        },
      },
    },
  )
}
