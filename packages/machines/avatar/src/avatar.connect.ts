import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./avatar.anatomy"
import { dom } from "./avatar.dom"
import type { MachineApi, Send, State } from "./avatar.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const loaded = state.matches("loaded")
  return {
    loaded,
    setSrc(src) {
      send({ type: "SRC.SET", src })
    },
    setLoaded() {
      send({ type: "IMG.LOADED", src: "api" })
    },
    setError() {
      send({ type: "IMG.ERROR", src: "api" })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: state.context.dir,
        id: dom.getRootId(state.context),
      })
    },

    getImageProps() {
      return normalize.img({
        ...parts.image.attrs,
        hidden: !loaded,
        dir: state.context.dir,
        id: dom.getImageId(state.context),
        "data-state": loaded ? "visible" : "hidden",
        onLoad() {
          send({ type: "IMG.LOADED", src: "element" })
        },
        onError() {
          send({ type: "IMG.ERROR", src: "element" })
        },
      })
    },

    getFallbackProps() {
      return normalize.element({
        ...parts.fallback.attrs,
        dir: state.context.dir,
        id: dom.getFallbackId(state.context),
        hidden: loaded,
        "data-state": loaded ? "hidden" : "visible",
      })
    },
  }
}
