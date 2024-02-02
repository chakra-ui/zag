import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./clipboard.anatomy"
import type { MachineApi, Send, State } from "./clipboard.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isCopied = state.matches("copied")

  return {
    isCopied,
    value: state.context.value,
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    triggerProps: normalize.button({
      ...parts.trigger,
      "data-copied": dataAttr(isCopied),
      onClick() {
        send({ type: "COPY" })
      },
    }),
    getIndicatorProps(props) {
      return normalize.element({
        ...parts.indicator,
        hidden: props.copied !== isCopied,
      })
    },
  }
}
