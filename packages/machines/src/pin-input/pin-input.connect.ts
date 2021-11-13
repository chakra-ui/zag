import { StateMachine as S } from "@ui-machines/core"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/prop-types"
import { ariaAttr, EventKeyMap, getEventKey } from "../utils"
import { dom } from "./pin-input.dom"
import { PinInputMachineContext, PinInputMachineState } from "./pin-input.types"

export function pinInputConnect<T extends PropTypes = ReactPropTypes>(
  state: S.State<PinInputMachineContext, PinInputMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state

  return {
    value: ctx.value,
    focusedIndex: ctx.focusedIndex,

    setValue(value: number[]) {
      send({ type: "SET_VALUE", value })
    },
    clearValue() {
      send({ type: "CLEAR_VALUE" })
    },
    setValueAtIndex(value: string, index: number) {
      send({ type: "SET_VALUE", value, index })
    },

    getInputProps({ index }: { index: number }) {
      const inputType = ctx.type === "numeric" ? "tel" : "text"
      return normalize.input<T>({
        id: dom.getInputId(ctx, index),
        "data-ownedby": dom.getRootId(ctx),
        "aria-label": "Please enter your pin code",
        inputMode: ctx.otp || ctx.type === "numeric" ? "numeric" : "text",
        "aria-invalid": ariaAttr(ctx.invalid),
        type: ctx.mask ? "password" : inputType,
        value: ctx.value[index] || "",
        autoComplete: ctx.otp ? "one-time-code" : "off",
        placeholder: ctx.focusedIndex === index ? "" : ctx.placeholder,
        onChange(event) {
          const evt = (event.nativeEvent ?? event) as InputEvent
          if (evt.isComposing) return

          const value = event.currentTarget.value

          if (evt.inputType === "insertFromPaste" || value.length > 2) {
            send({ type: "PASTE", value })
          }

          if (evt.inputType === "insertText") {
            send({ type: "INPUT", value })
          }
        },
        onKeyDown(event) {
          const evt = (event.nativeEvent ?? event) as KeyboardEvent
          if (evt.isComposing) return

          const keyMap: EventKeyMap = {
            Backspace() {
              send("BACKSPACE")
            },
            Delete() {
              send("DELETE")
            },
            ArrowLeft() {
              send("ARROW_LEFT")
            },
            ArrowRight() {
              send("ARROW_RIGHT")
            },
          }

          const key = getEventKey(event, { orientation: "horizontal", dir: ctx.dir })
          const exec = keyMap[key]

          if (exec) {
            event.preventDefault()
            exec?.(event)
          }
        },
        onFocus() {
          send({ type: "FOCUS", index })
        },
        onBlur() {
          send({ type: "BLUR", index })
        },
      })
    },
  }
}
