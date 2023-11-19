import { type NormalizeProps, type PropTypes } from "@zag-js/types"
import { parts } from "./scroll-area.anatomy"
import { dom } from "./scroll-area.dom"
import { type Send, type State } from "./scroll-area.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isSticky = state.matches("sticky")
  return {
    isSticky,
    scrollToStart() {},
    scrollToEnd() {},
    scrollToSticky() {
      send({ type: "STICKY.START" })
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
    }),

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        type: "button",
      })
    },

    getIndicatorProps() {
      return normalize.element({})
    },

    progressProps: normalize.element({
      ...parts.progress.attrs,
      role: "progressbar",
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-valuenow": 0,
      "aria-valuetext": "0%",
    }),
  }
}
