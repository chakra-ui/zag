import { ariaAttr, dataAttr } from "@zag-js/dom-utils"
import { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./pressable.dom"
import { State, Send } from "./pressable.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isPressed = state.hasTag("pressed")
  const isDisabled = state.context.disabled
  return {
    isPressed,
    pressableProps: normalize.element({
      id: dom.getPressableId(state.context),
      onKeyDown: (event) => send({ type: "KEYDOWN", event, pointerType: "keyboard" }),
      onKeyUp: (event) => send({ type: "KEYUP", event, pointerType: "keyboard" }),
      onClick: (event) => send({ type: "CLICK", event, pointerType: "virtual" }),
      onPointerDown: (event) => send({ type: "POINTER_DOWN", event }),
      // onMouseDown: (event) => send({ type: "MOUSE_DOWN", event }),
      onPointerUp: (event) => send({ type: "POINTER_UP", event }),
      onDragStart: (event) => send({ type: "DRAG_START", event }),

      "aria-disabled": ariaAttr(isDisabled),
      "aria-pressed": ariaAttr(isPressed),
      "data-disabled": dataAttr(isDisabled),
      "data-pressed": dataAttr(isPressed),
    }),
  }
}
