import { createMachine } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import { dom } from "./clipboard.dom"
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
              actions: ["copyToClipboard", "invokeOnCopied"],
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
              actions: ["copyToClipboard", "invokeOnCopied"],
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
          dom.writeToClipboard(ctx)
        },
        invokeOnCopied(ctx) {
          ctx.onCopyStatusChange?.({ copied: true })
        },
      },
      delays: {
        COPY_TIMEOUT: (ctx) => ctx.timeout,
      },
    },
  )
}
