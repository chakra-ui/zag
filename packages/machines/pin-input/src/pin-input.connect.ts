import { StateMachine as S } from "@ui-machines/core"
import { ariaAttr, dataAttr, EventKeyMap, getEventKey, getNativeEvent } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { isModifiedEvent } from "@ui-machines/utils"
import { dom } from "./pin-input.dom"
import { MachineContext, MachineState } from "./pin-input.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: S.State<MachineContext, MachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  return {
    value: state.context.value,
    focusedIndex: state.context.focusedIndex,

    setValue(value: number[]) {
      send({ type: "SET_VALUE", value })
    },
    clearValue() {
      send({ type: "CLEAR_VALUE" })
    },
    setValueAtIndex(value: string, index: number) {
      send({ type: "SET_VALUE", value, index })
    },
    focus() {
      dom.getFirstInputEl(state.context)?.focus()
    },
    blur() {
      if (state.context.focusedIndex === -1) return
      dom.getFirstInputEl(state.context)?.blur()
    },

    containerProps: normalize.element<T>({
      "data-part": "container",
      id: dom.getRootId(state.context),
      "data-invalid": dataAttr(state.context.invalid),
      "data-disabled": dataAttr(state.context.disabled),
      "data-complete": dataAttr(state.context.isValueComplete),
    }),

    getInputProps({ index }: { index: number }) {
      const inputType = state.context.type === "numeric" ? "tel" : "text"
      return normalize.input<T>({
        "data-part": "input",
        disabled: state.context.disabled,
        "data-disabled": dataAttr(state.context.disabled),
        "data-complete": dataAttr(state.context.isValueComplete),
        id: dom.getInputId(state.context, index),
        "data-ownedby": dom.getRootId(state.context),
        "aria-label": "Please enter your pin code",
        inputMode: state.context.otp || state.context.type === "numeric" ? "numeric" : "text",
        "aria-invalid": ariaAttr(state.context.invalid),
        "data-invalid": dataAttr(state.context.invalid),
        type: state.context.mask ? "password" : inputType,
        value: state.context.value[index] || "",
        autoCapitalize: "off",
        autoComplete: state.context.otp ? "one-time-code" : "off",
        placeholder: state.context.focusedIndex === index ? "" : state.context.placeholder,
        onChange(event) {
          const evt = getNativeEvent(event)
          if (evt.isComposing) return

          const value = event.target.value

          if (evt.inputType === "insertFromPaste" || value.length > 2) {
            send({ type: "PASTE", value })
            event.preventDefault()
            return
          }

          if (evt.inputType === "insertText") {
            send({ type: "INPUT", value })
          }
        },
        onKeyDown(event) {
          const evt = getNativeEvent(event)
          if (evt.isComposing || isModifiedEvent(evt)) return

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

          const key = getEventKey(event, { dir: state.context.dir })
          const exec = keyMap[key]

          if (exec) {
            exec?.(event)
            event.preventDefault()
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
