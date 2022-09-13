import {
  ariaAttr,
  dataAttr,
  EventKeyMap,
  getEventKey,
  getNativeEvent,
  isModifiedEvent,
  visuallyHiddenStyle,
} from "@zag-js/dom-utils"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { invariant } from "@zag-js/utils"
import { dom } from "./pin-input.dom"
import type { Send, State } from "./pin-input.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isValueComplete = state.context.isValueComplete
  const isInvalid = state.context.invalid
  const focusedIndex = state.context.focusedIndex
  const messages = state.context.messages

  function focus() {
    dom.getFirstInputEl(state.context)?.focus()
  }

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
    focus,

    rootProps: normalize.element({
      dir: state.context.dir,
      "data-part": "root",
      id: dom.getRootId(state.context),
      "data-invalid": dataAttr(isInvalid),
      "data-disabled": dataAttr(state.context.disabled),
      "data-complete": dataAttr(isValueComplete),
    }),

    labelProps: normalize.label({
      "data-part": "label",
      htmlFor: dom.getHiddenInputId(state.context),
      id: dom.getLabelId(state.context),
      "data-invalid": dataAttr(isInvalid),
      "data-disabled": dataAttr(state.context.disabled),
      "data-complete": dataAttr(isValueComplete),
      onClick: (event) => {
        event.preventDefault()
        focus()
      },
    }),

    hiddenInputProps: normalize.input({
      "aria-hidden": true,
      type: "text",
      tabIndex: -1,
      id: dom.getHiddenInputId(state.context),
      name: state.context.name,
      style: visuallyHiddenStyle,
      maxLength: state.context.valueLength,
      defaultValue: state.context.valueAsString,
    }),

    getInputProps({ index }: { index: number }) {
      const inputType = state.context.type === "numeric" ? "tel" : "text"
      return normalize.input({
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
          const { value } = event.currentTarget
          if (evt.inputType === "insertFromPaste" || value.length > 2) {
            send({ type: "PASTE", value })
            event.preventDefault()
            return
          }

          if (evt.inputType === "deleteContentBackward") {
            send("BACKSPACE")
            return
          }
          send({ type: "INPUT", value })
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
            Enter() {
              send("ENTER")
            },
          }

          const key = getEventKey(event, { dir: state.context.dir })
          const exec = keyMap[key]

          if (exec) {
            exec(event)
            event.preventDefault()
          } else {
            if (key === "Tab") return
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
