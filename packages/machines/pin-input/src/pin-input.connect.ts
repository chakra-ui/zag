import { type EventKeyMap, getEventKey, getNativeEvent, isModifiedEvent } from "@zag-js/dom-event"
import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { invariant } from "@zag-js/utils"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import { parts } from "./pin-input.anatomy"
import { dom } from "./pin-input.dom"
import type { Send, State } from "./pin-input.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isValueComplete = state.context.isValueComplete
  const isInvalid = state.context.invalid
  const focusedIndex = state.context.focusedIndex
  const translations = state.context.translations

  function focus() {
    dom.getFirstInputEl(state.context)?.focus()
  }

  return {
    /**
     * The value of the input as an array of strings.
     */
    value: state.context.value,
    /**
     * The value of the input as a string.
     */
    valueAsString: state.context.valueAsString,
    /**
     * Whether all inputs are filled.
     */
    isValueComplete: isValueComplete,
    /**
     * Function to set the value of the inputs.
     */
    setValue(value: string[]) {
      if (!Array.isArray(value)) {
        invariant("[pin-input/setValue] value must be an array")
      }
      send({ type: "SET_VALUE", value })
    },
    /**
     * Function to clear the value of the inputs.
     */
    clearValue() {
      send({ type: "CLEAR_VALUE" })
    },
    /**
     * Function to set the value of the input at a specific index.
     */
    setValueAtIndex(index: number, value: string) {
      send({ type: "SET_VALUE", value, index })
    },
    /**
     * Function to focus the pin-input. This will focus the first input.
     */
    focus,

    rootProps: normalize.element({
      dir: state.context.dir,
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
      "data-invalid": dataAttr(isInvalid),
      "data-disabled": dataAttr(state.context.disabled),
      "data-complete": dataAttr(isValueComplete),
    }),

    labelProps: normalize.label({
      ...parts.label.attrs,
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
      ...parts.hiddenInput.attrs,
      "aria-hidden": true,
      type: "text",
      tabIndex: -1,
      id: dom.getHiddenInputId(state.context),
      name: state.context.name,
      form: state.context.form,
      style: visuallyHiddenStyle,
      maxLength: state.context.valueLength,
      defaultValue: state.context.valueAsString,
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      id: dom.getControlId(state.context),
    }),

    getInputProps({ index }: { index: number }) {
      const inputType = state.context.type === "numeric" ? "tel" : "text"
      return normalize.input({
        ...parts.input.attrs,
        disabled: state.context.disabled,
        "data-disabled": dataAttr(state.context.disabled),
        "data-complete": dataAttr(isValueComplete),
        id: dom.getInputId(state.context, index.toString()),
        "data-ownedby": dom.getRootId(state.context),
        "aria-label": translations.inputLabel(index, state.context.valueLength),
        inputMode: state.context.otp || state.context.type === "numeric" ? "numeric" : "text",
        "aria-invalid": ariaAttr(isInvalid),
        "data-invalid": dataAttr(isInvalid),
        type: state.context.mask ? "password" : inputType,
        defaultValue: state.context.value[index] || "",
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
          send({ type: "INPUT", value, index })
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
