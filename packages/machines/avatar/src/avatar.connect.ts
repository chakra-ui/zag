import { dataAttr } from "@zag-js/dom-query"
import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { parts } from "./avatar.anatomy"
import { dom } from "./avatar.dom"
import { Send, State } from "./avatar.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isLoaded = state.matches("loaded")
  const showFallback = !isLoaded

  return {
    /**
     * Whether the image is loaded.
     */
    isLoaded,
    /**
     * Whether the fallback is shown.
     */
    showFallback,
    /**
     * Function to set new src.
     */
    setSrc(src: string) {
      send({ type: "SRC.SET", src })
    },
    /**
     * Function to set loaded state.
     */
    setLoaded() {
      send({ type: "IMG.LOADED", src: "api" })
    },
    /**
     * Function to set error state.
     */
    setError() {
      send({ type: "IMG.ERROR", src: "api" })
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
      style: {
        display: "grid",
        gridTemplateRows: "1fr 1fr",
        overflow: "hidden",
      },
    }),

    imageProps: normalize.img({
      ...parts.image.attrs,
      id: dom.getImageId(state.context),
      "data-loaded": dataAttr(isLoaded),
      onLoad() {
        send({ type: "IMG.LOADED", src: "element" })
      },
      onError() {
        send({ type: "IMG.ERROR", src: "element" })
      },
      style: {
        gridArea: "1 / 1 / 2 / 2",
        visibility: !isLoaded ? "hidden" : undefined,
      },
    }),

    fallbackProps: normalize.element({
      ...parts.fallback.attrs,
      id: dom.getFallbackId(state.context),
      hidden: !showFallback,
      style: {
        gridArea: "1 / 1 / 2 / 2",
      },
    }),
  }
}
