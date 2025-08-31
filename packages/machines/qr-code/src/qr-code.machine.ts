import { getDataUrl } from "@zag-js/dom-query"
import { createMachine, memo } from "@zag-js/core"
import { encode } from "uqr"
import * as dom from "./qr-code.dom"
import type { QrCodeSchema } from "./qr-code.types"

export const machine = createMachine<QrCodeSchema>({
  props({ props }) {
    return {
      defaultValue: "",
      pixelSize: 10,
      ...props,
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable }) {
    return {
      value: bindable(() => ({
        value: prop("value"),
        defaultValue: prop("defaultValue"),
        onChange(value) {
          prop("onValueChange")?.({ value })
        },
      })),
    }
  },

  computed: {
    encoded: memo(
      ({ context, prop }) => [context.get("value"), prop("encoding")],
      ([value, encoding]) => encode(value, encoding),
    ),
  },

  states: {
    idle: {
      on: {
        "VALUE.SET": {
          actions: ["setValue"],
        },
        "DOWNLOAD_TRIGGER.CLICK": {
          actions: ["downloadQrCode"],
        },
      },
    },
  },

  implementations: {
    actions: {
      setValue({ context, event }) {
        context.set("value", event.value)
      },
      downloadQrCode({ event, scope }) {
        const { mimeType, quality, fileName } = event
        const svgEl = dom.getFrameEl(scope)
        const doc = scope.getDoc()
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
})
