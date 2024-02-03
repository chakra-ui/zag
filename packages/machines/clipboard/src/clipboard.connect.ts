import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./clipboard.anatomy"
import type { MachineApi, Send, State } from "./clipboard.types"
import { dom } from "./clipboard.dom"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isCopied = state.matches("copied")

  return {
    isCopied,
    value: state.context.value,
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      id: dom.getTriggerId(state.context),
      "data-copied": dataAttr(isCopied),
      onClick() {
        send({ type: "COPY" })
      },
    }),
    getIndicatorProps(props) {
      return normalize.element({
        ...parts.indicator.attrs,
        hidden: props.copied !== isCopied,
      })
    },
  }
}
