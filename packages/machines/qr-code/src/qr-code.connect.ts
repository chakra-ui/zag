import { getDataUrl } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./qr-code.anatomy"
import { dom } from "./qr-code.dom"
import type { MachineApi, Send, State } from "./qr-code.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const encoded = state.context.encoded
  const pixelSize = state.context.pixelSize

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
    value: state.context.value,
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    getDataUrl(type, quality) {
      const svgEl = dom.getFrameEl(state.context)
      return getDataUrl(svgEl, { type, quality })
    },

    getRootProps() {
      return normalize.element({
        id: dom.getRootId(state.context),
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
        id: dom.getFrameId(state.context),
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
  }
}
