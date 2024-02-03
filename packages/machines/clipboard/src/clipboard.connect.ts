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
    rootProps: normalize.element({
      ...parts.root.attrs,
      "data-copied": dataAttr(isCopied),
      id: dom.getRootId(state.context),
    }),
    labelProps: normalize.label({
      ...parts.label.attrs,
      htmlFor: dom.getInputId(state.context),
      "data-copied": dataAttr(isCopied),
      id: dom.getLabelId(state.context),
    }),
    controlProps: normalize.element({
      ...parts.control.attrs,
      "data-copied": dataAttr(isCopied),
    }),
    inputProps: normalize.input({
      ...parts.input.attrs,
      defaultValue: state.context.value,
      "data-copied": dataAttr(isCopied),
      readOnly: true,
      "data-readonly": "true",
      id: dom.getInputId(state.context),
      onFocus(event) {
        event.currentTarget.select()
      },
    }),
    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      "aria-label": isCopied ? "Copied to clipboard" : "Copy to clipboard",
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
