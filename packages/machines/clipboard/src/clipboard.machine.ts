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
      watch: {
        value: ["syncInputElement"],
      },
      on: {
        "VALUE.SET": {
          actions: ["setValue"],
        },
        COPY: {
          target: "copied",
          actions: ["copyToClipboard", "invokeOnCopy"],
        },
      },
      states: {
        idle: {
          on: {
            "INPUT.COPY": {
              target: "copied",
              actions: ["invokeOnCopy"],
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
              actions: ["copyToClipboard", "invokeOnCopy"],
            },
            "INPUT.COPY": {
              actions: ["invokeOnCopy"],
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
        invokeOnCopy(ctx) {
          ctx.onStatusChange?.({ copied: true })
        },
        syncInputElement(ctx) {
          dom.setValue(dom.getInputEl(ctx), ctx.value)
        },
      },
      delays: {
        COPY_TIMEOUT: (ctx) => ctx.timeout,
      },
    },
  )
}
