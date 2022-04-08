import { dataAttr } from "@zag-js/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@zag-js/types"
import { dom } from "./toggle.dom"
import { Send, State } from "./toggle.types"

export function connect<T extends PropTypes = ReactPropTypes>(state: State, send: Send, normalize = normalizeProp) {
  const isPressed = state.matches("pressed")
  const isDisabled = state.context.disabled

  return {
    isPressed,
    buttonProps: normalize.button<T>({
      id: dom.getButtonId(state.context),
      type: "button",
      "aria-label": state.context.label,
      "aria-pressed": isPressed,
      "data-disabled": dataAttr(isDisabled),
      "data-pressed": dataAttr(isPressed),
      onClick() {
        if (isDisabled) return
        send({ type: "CLICK", pressed: isPressed })
      },
    }),
  }
}
