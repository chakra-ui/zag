import { getDataUrl } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./qr-code.anatomy"
import * as dom from "./qr-code.dom"
import type { QrCodeApi, QrCodeService } from "./qr-code.types"

export function connect<T extends PropTypes>(service: QrCodeService, normalize: NormalizeProps<T>): QrCodeApi<T> {
  const { context, computed, send, scope, prop } = service

  const encoded = computed("encoded")
  const pixelSize = prop("pixelSize")

  const height = encoded.size * pixelSize
  const width = encoded.size * pixelSize

  const paths: string[] = []

  for (let row = 0; row < encoded.size; row++) {
    for (let col = 0; col < encoded.size; col++) {
      const x = col * pixelSize
      const y = row * pixelSize
      if (encoded.data[row][col]) {
        paths.push(`M${x},${y}h${pixelSize}v${pixelSize}h-${pixelSize}z`)
      }
    }
  }

  return {
    value: context.get("value"),
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    getDataUrl(type, quality) {
      const svgEl = dom.getFrameEl(scope)
      return getDataUrl(svgEl, { type, quality })
    },

    getRootProps() {
      return normalize.element({
        id: dom.getRootId(scope),
        ...parts.root.attrs,
        style: {
          "--qrcode-pixel-size": `${pixelSize}px`,
          "--qrcode-width": `${width}px`,
          "--qrcode-height": `${height}px`,
          position: "relative",
        },
      })
    },

    getFrameProps() {
      return normalize.svg({
        id: dom.getFrameId(scope),
        ...parts.frame.attrs,
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: `0 0 ${width} ${height}`,
      })
    },

    getPatternProps() {
      return normalize.path({
        d: paths.join(""),
        ...parts.pattern.attrs,
      })
    },

    getOverlayProps() {
      return normalize.element({
        ...parts.overlay.attrs,
        style: {
          position: "absolute",
          top: "50%",
          left: "50%",
          translate: "-50% -50%",
        },
      })
    },

    getDownloadTriggerProps(props) {
      return normalize.button({
        type: "button",
        ...parts.downloadTrigger.attrs,
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: "DOWNLOAD_TRIGGER.CLICK", ...props })
        },
      })
    },
  }
}
