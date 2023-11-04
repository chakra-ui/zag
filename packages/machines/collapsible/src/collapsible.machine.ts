import { createMachine } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./collapsible.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "collapsible",
      initial: ctx.open ? "open" : "closed",

      context: {
        open: false,
        disabled: false,
        ...ctx,
      },

      computed: {
        isDisabled: (ctx) => !!ctx.disabled,
      },

      on: {
        "CONTEXT.SET": {
          actions: ["setContext"],
        },
      },

      states: {
        closed: {
          on: {
            TOGGLE: {
              target: "open",
              actions: ["invokeOnOpen"],
            },
            OPEN: {
              target: "open",
              actions: ["invokeOnOpen"],
            },
          },
        },
        open: {
          on: {
            TOGGLE: {
              target: "closed",
              actions: ["invokeOnClose"],
            },
            CLOSE: {
              target: "closed",
              actions: ["invokeOnClose"],
            },
          },
        },
      },
    },
    {
      guards: {},
      actions: {
        setContext(ctx, evt) {
          Object.assign(ctx, evt.context)
        },
        invokeOnOpen: (ctx) => {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose: (ctx) => {
          ctx.onOpenChange?.({ open: false })
        },
      },
    },
  )
}
