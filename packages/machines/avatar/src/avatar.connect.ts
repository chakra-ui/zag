import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { Service } from "@zag-js/core"
import { parts } from "./avatar.anatomy"
import * as dom from "./avatar.dom"
import type { AvatarApi, AvatarSchema } from "./avatar.types"

export function connect<T extends PropTypes>(
  service: Service<AvatarSchema>,
  normalize: NormalizeProps<T>,
): AvatarApi<T> {
  const { state, send, prop, scope } = service
  const loaded = state.matches("loaded")
  return {
    loaded,
    setSrc(src) {
      const img = dom.getImageEl(scope)
      img?.setAttribute("src", src)
    },
    setLoaded() {
      send({ type: "img.loaded", src: "api" })
    },
    setError() {
      send({ type: "img.error", src: "api" })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: prop("dir"),
        id: dom.getRootId(scope),
      })
    },

    getImageProps() {
      return normalize.img({
        ...parts.image.attrs,
        hidden: !loaded,
        dir: prop("dir"),
        id: dom.getImageId(scope),
        "data-state": loaded ? "visible" : "hidden",
        onLoad() {
          send({ type: "img.loaded", src: "element" })
        },
        onError() {
          send({ type: "img.error", src: "element" })
        },
      })
    },

    getFallbackProps() {
      return normalize.element({
        ...parts.fallback.attrs,
        dir: prop("dir"),
        id: dom.getFallbackId(scope),
        hidden: loaded,
        "data-state": loaded ? "hidden" : "visible",
      })
    },
  }
}
