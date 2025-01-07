import { createMachine } from "@zag-js/core"
import { getDataUrl } from "@zag-js/dom-query"
import { compact, isEqual } from "@zag-js/utils"
import { memoize } from "proxy-memoize"
import { encode } from "uqr"
import { dom } from "./qr-code.dom"
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
        "DOWNLOAD_TRIGGER.CLICK": {
          actions: ["downloadQrCode"],
        },
      },
    },
    {
      actions: {
        setValue(ctx, evt) {
          set.value(ctx, evt.value)
        },
        downloadQrCode(ctx, evt) {
          const { mimeType, quality, fileName } = evt
          const svgEl = dom.getFrameEl(ctx)
          const doc = dom.getDoc(ctx)
          getDataUrl(svgEl, { type: mimeType, quality }).then((dataUri) => {
            const a = doc.createElement("a")
            a.href = dataUri
            a.rel = "noopener"
            a.download = fileName
            a.click()
            setTimeout(() => {
              a.remove()
            }, 0)
          })
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
