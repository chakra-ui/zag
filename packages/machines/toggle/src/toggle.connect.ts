import { dataAttr } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./toggle.dom"
import { ToggleSend, ToggleState } from "./toggle.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: ToggleState,
  send: ToggleSend,
  normalize = normalizeProp,
) {
  const { context: ctx } = state
  const isPressed = state.matches("pressed")

  return {
    isPressed,
    buttonProps: normalize.button<T>({
      id: dom.getButtonId(ctx),
      type: "button",
      "aria-label": ctx.label,
      "aria-pressed": isPressed,
      "data-disabled": dataAttr(ctx.disabled),
      "data-pressed": dataAttr(isPressed),
      onClick() {
        if (ctx.disabled) return
        send({ type: "CLICK", pressed: isPressed })
      },
    }),
  }
}
