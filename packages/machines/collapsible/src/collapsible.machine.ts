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
        animate: false,
        animationDuration: 300,
        ...ctx,
        height: 0,
      },

      computed: {
        isDisabled: (ctx) => !!ctx.disabled,
        isAnimated: (ctx) => !!ctx.animate,
        duration: (ctx) => (ctx.isAnimated ? ctx.animationDuration : 0),
      },

      on: {
        "CONTEXT.SET": {
          actions: ["setContext"],
        },
      },

      states: {
        closed: {
          tags: ["hidden"],
          on: {
            TOGGLE: {
              target: "opening",
              actions: ["invokeOnOpening"],
            },
            OPEN: {
              target: "opening",
              actions: ["invokeOnOpening"],
            },
          },
        },

        opening: {
          after: {
            ANIMATION_DELAY: {
              target: "open",
              actions: ["invokeOnOpen"],
            },
          },
        },

        open: {
          on: {
            TOGGLE: {
              target: "closing",
              actions: ["invokeOnClosing"],
            },
            CLOSE: {
              target: "closing",
              actions: ["invokeOnClosing"],
            },
          },
        },

        closing: {
          after: {
            ANIMATION_DELAY: {
              target: "closed",
              actions: ["invokeOnClose"],
            },
          },
        },
      },
    },
    {
      delays: {
        ANIMATION_DELAY: (ctx) => ctx.duration,
      },

      guards: {},
      actions: {
        setContext(ctx, evt) {
          Object.assign(ctx, evt.context)
        },
        invokeOnOpening: (ctx) => {
          ctx.opening = true
        },
        invokeOnOpen: (ctx) => {
          ctx.onOpenChange?.({ open: true })
          ctx.open = true
          ctx.opening = false
        },
        invokeOnClosing: (ctx) => {
          ctx.closing = true
        },
        invokeOnClose: (ctx) => {
          ctx.onOpenChange?.({ open: false })
          ctx.open = false
          ctx.closing = false
        },
      },
    },
  )
}
