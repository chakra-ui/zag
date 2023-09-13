import { createMachine } from "@zag-js/core"
import { compact, isEqual } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./disclosure.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "disclosure",
      initial: "idle",
      context: {
        ...ctx,
      },
      states: {
        idle: {
          on: {
            "BUTTON.FOCUS": {
              target: "focused",
              actions: "setFocused",
            },
          },
        },
        focused: {
          on: {
            "BUTTON.BLUR": {
              target: "idle",
              actions: "clearFocus",
            },
          },
        },
      },
      on: {
        "OPEN.TOGGLE": {
          actions: ["toggleOpen"],
        },
        "OPEN.SET": {
          actions: ["setOpen"],
        },
        "CONTEXT.SET": {
          actions: ["setContext"],
        },
      },
    },
    {
      guards: {},
      actions: {
        setContext(ctx, evt) {
          Object.assign(ctx, evt.context)
        },
        setOpen(ctx, evt) {
          set.open(ctx, evt.open)
        },
        toggleOpen(ctx) {
          set.open(ctx, !ctx.open)
        },
        setFocused(ctx) {
          set.focused(ctx, true)
        },
        clearFocus(ctx) {
          set.focused(ctx, false)
        },
      },
    },
  )
}

const invoke = {
  change: (ctx: MachineContext) => {
    ctx.onChange?.({ open: !!ctx.open })
  },
}

const set = {
  open: (ctx: MachineContext, value: boolean) => {
    if (isEqual(ctx.open, value)) return
    ctx.open = value
    invoke.change(ctx)
  },
  focused(ctx: MachineContext, value: boolean) {
    if (isEqual(ctx.focused, value)) return
    ctx.focused = value
  },
}
