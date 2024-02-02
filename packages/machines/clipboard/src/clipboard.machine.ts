import { createMachine } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./clipboard.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "clipboard",
      initial: "idle",
      context: {
        value: "",
        timeout: 3000,
        ...ctx,
      },
      on: {
        "VALUE.SET": {
          actions: ["setValue"],
        },
      },
      states: {
        idle: {
          on: {
            COPY: {
              target: "copied",
              actions: ["copyToClipboard"],
            },
          },
        },
        copied: {
          after: {
            COPY_TIMEOUT: "idle",
          },
          on: {
            COPY: {
              target: "copied",
              actions: ["copyToClipboard"],
            },
          },
        },
      },
    },
    {
      actions: {
        setValue(ctx, evt) {
          ctx.value = evt.value
        },
        copyToClipboard(ctx) {
          navigator.clipboard.writeText(ctx.value)
        },
        invokeOnCopyStatusChange(ctx) {
          ctx.onCopyStatusChange?.({ copied: true })
        },
      },
      delays: {
        COPY_TIMEOUT: (ctx) => ctx.timeout,
      },
    },
  )
}
