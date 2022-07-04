import { dataAttr } from "@zag-js/dom-utils"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./toggle.dom"
import type { Send, State } from "./toggle.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isPressed = state.matches("pressed")
  const disabled = state.context.disabled

  return {
    isPressed,
    setPressed(value: boolean) {
      send({ type: "SET_STATE", pressed: value })
    },
    buttonProps: normalize.button({
      id: dom.getButtonId(state.context),
      type: "button",
      disabled,
      "aria-label": state.context.label,
      "aria-pressed": isPressed,
      "data-disabled": dataAttr(disabled),
      "data-pressed": dataAttr(isPressed),
      onClick() {
        if (disabled) return
        send({ type: "TOGGLE", pressed: isPressed })
      },
    }),
  }
}
