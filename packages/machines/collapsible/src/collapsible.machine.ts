import { createMachine } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import { dom } from "./collapsible.dom"
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
        height: 0,
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
              actions: ["computeHeight", "invokeOnOpen"],
            },
            OPEN: {
              target: "open",
              actions: ["computeHeight", "invokeOnOpen"],
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
        computeHeight: (ctx) => {
          ctx.height = dom.getContentEl(ctx)?.scrollHeight ?? 0
        },
        invokeOnOpen: (ctx) => {
          ctx.onOpenChange?.({ open: true })
          ctx.open = true
        },
        invokeOnClose: (ctx) => {
          ctx.onOpenChange?.({ open: false })
          ctx.open = false
        },
      },
    },
  )
}
