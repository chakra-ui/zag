import { dataAttr } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./toggle.dom"
import { ToggleSend, ToggleState } from "./toggle.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: ToggleState,
  send: ToggleSend,
  normalize = normalizeProp,
) {
  const isPressed = state.matches("pressed")

  return {
    isPressed,
    buttonProps: normalize.button<T>({
      id: dom.getButtonId(state.context),
      type: "button",
      "aria-label": state.context.label,
      "aria-pressed": isPressed,
      "data-disabled": dataAttr(state.context.disabled),
      "data-pressed": dataAttr(isPressed),
      onClick() {
        if (state.context.disabled) return
        send({ type: "CLICK", pressed: isPressed })
      },
    }),
  }
}
