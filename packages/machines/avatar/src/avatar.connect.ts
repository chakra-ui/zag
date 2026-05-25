import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { Service } from "@zag-js/core"
import { parts } from "./avatar.anatomy"
import * as dom from "./avatar.dom"
import type { AvatarApi, AvatarSchema, AvatarService, LoadStatus } from "./avatar.types"

export function connect<T extends PropTypes>(
  service: Service<AvatarSchema>,
  normalize: NormalizeProps<T>,
): AvatarApi<T> {
  const { send, prop, scope } = service
  const status = getStatus(service)
  const loaded = status === "loaded"
  return {
    status,
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
        ...parts.root.attrs(scope.id),
        dir: prop("dir"),
      })
    },

    getImageProps() {
      return normalize.img({
        ...parts.image.attrs(scope.id),
        hidden: !loaded,
        dir: prop("dir"),
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
        ...parts.fallback.attrs(scope.id),
        dir: prop("dir"),
        hidden: loaded,
        "data-state": loaded ? "hidden" : "visible",
      })
    },
  }
}

function getStatus(service: AvatarService): LoadStatus {
  const { state } = service
  if (state.matches("error")) return "error"
  if (state.matches("loaded")) return "loaded"
  return "loading"
}
