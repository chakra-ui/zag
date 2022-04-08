import { dataAttr } from "@zag-js/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@zag-js/types"
import { dom } from "./toggle.dom"
import { ToggleSend, ToggleState } from "./toggle.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: ToggleState,
  send: ToggleSend,
  normalize = normalizeProp,
) {
  const isPressed = state.matches("pressed")
  const isDisabled = state.context.disabled
  const messages = state.context.messages

  return {
    isPressed,
    buttonProps: normalize.button<T>({
      id: dom.getButtonId(state.context),
      type: "button",
      "aria-label": messages.buttonLabel,
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
