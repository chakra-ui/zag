import { StateMachine as S } from "@zag-js/core"
import { ariaAttr, dataAttr, EventKeyMap, getEventKey, getNativeEvent, nextTick } from "@zag-js/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@zag-js/types"
import { invariant, isModifiedEvent } from "@zag-js/utils"
import { dom } from "./pin-input.dom"
import { MachineContext, MachineState } from "./pin-input.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: S.State<MachineContext, MachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const isValueComplete = state.context.isValueComplete
  const isInvalid = state.context.invalid
  const focusedIndex = state.context.focusedIndex
  const messages = state.context.messages

  return {
    value: state.context.value,
    valueAsString: state.context.valueAsString,
    isValueComplete: isValueComplete,
    setValue(value: string[]) {
      if (!Array.isArray(value)) {
        invariant("[pin-input/setValue] value must be an array")
      }
      send({ type: "SET_VALUE", value })
    },
    clearValue() {
      send({ type: "CLEAR_VALUE" })
    },
    setValueAtIndex(index: number, value: string) {
      send({ type: "SET_VALUE", value, index })
    },
    focus() {
      nextTick(() => {
        dom.getFirstInputEl(state.context)?.focus()
      })
    },

    rootProps: normalize.element<T>({
      dir: state.context.dir,
      "data-part": "root",
      id: dom.getRootId(state.context),
      "data-invalid": dataAttr(isInvalid),
      "data-disabled": dataAttr(state.context.disabled),
      "data-complete": dataAttr(isValueComplete),
    }),

    getInputProps({ index }: { index: number }) {
      const inputType = state.context.type === "numeric" ? "tel" : "text"
      return normalize.input<T>({
        "data-part": "input",
        disabled: state.context.disabled,
        "data-disabled": dataAttr(state.context.disabled),
        "data-complete": dataAttr(isValueComplete),
        id: dom.getInputId(state.context, index.toString()),
        "data-ownedby": dom.getRootId(state.context),
        "aria-label": messages.inputLabel(index, state.context.valueLength),
        inputMode: state.context.otp || state.context.type === "numeric" ? "numeric" : "text",
        "aria-invalid": ariaAttr(isInvalid),
        "data-invalid": dataAttr(isInvalid),
        type: state.context.mask ? "password" : inputType,
        value: state.context.value[index] || "",
        autoCapitalize: "none",
        autoComplete: state.context.otp ? "one-time-code" : "off",
        placeholder: focusedIndex === index ? "" : state.context.placeholder,
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
            exec(event)
            event.preventDefault()
          } else {
            send({ type: "KEY_DOWN", value: key, preventDefault: () => event.preventDefault() })
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
