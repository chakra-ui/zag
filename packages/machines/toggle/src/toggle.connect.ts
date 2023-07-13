import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./toggle.dom"
import type { PublicApi, Send, State } from "./toggle.types"
import { parts } from "./toggle.anatomy"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): PublicApi<T> {
  const isPressed = state.context.pressed
  const isDisabled = state.context.disabled

  return {
    isPressed,

    setPressed(pressed: boolean) {
      send({ type: "PRESSED.SET", pressed })
    },
    buttonProps: normalize.button({
      ...parts.button.attrs,
      id: dom.getButtonId(state.context),
      type: "button",
      disabled: isDisabled,
      "aria-label": state.context["aria-label"],
      "aria-pressed": isPressed,
      "data-disabled": dataAttr(isDisabled),
      "data-pressed": dataAttr(isPressed),
      onClick() {
        if (isDisabled) return
        send({ type: "PRESSED.TOGGLE" })
      },
    }),
  }
}
