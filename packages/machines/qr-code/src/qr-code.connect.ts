import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./qr-code.anatomy"
import { dom } from "./qr-code.dom"
import type { Send, State } from "./qr-code.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
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
    setValue(value: string) {
      send({ type: "VALUE.SET", value })
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

    getSvgProps() {
      return normalize.svg({
        ...parts.svg.attrs,
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: `0 0 ${width} ${height}`,
      })
    },

    getPathProps() {
      return normalize.path({
        d: paths.join(""),
        ...parts.path.attrs,
      })
    },

    getImageProps() {
      return normalize.img({
        ...parts.image.attrs,
        alt: "qr code",
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
