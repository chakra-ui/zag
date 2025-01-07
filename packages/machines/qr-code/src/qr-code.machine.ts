import { createMachine } from "@zag-js/core"
import { compact, isEqual } from "@zag-js/utils"
import { memoize } from "proxy-memoize"
import { encode } from "uqr"
import type { MachineContext, MachineState, UserDefinedContext } from "./qr-code.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "qr-code",
      initial: "idle",
      context: {
        value: "",
        ...ctx,
        pixelSize: 10,
      },

      computed: {
        encoded: memoize((ctx) => encode(ctx.value, ctx.encoding)),
      },

      on: {
        "VALUE.SET": {
          actions: ["setValue"],
        },
      },
    },
    {
      actions: {
        setValue(ctx, evt) {
          set.value(ctx, evt.value)
        },
      },
    },
  )
}

const set = {
  value(ctx: MachineContext, value: string) {
    if (isEqual(ctx.value, value)) return
    ctx.value = value
    ctx.onValueChange?.({ value })
  },
}
