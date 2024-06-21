import { getEventKey, getNativeEvent, isModifierKey, type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr, getBeforeInputValue, isComposingEvent, visuallyHiddenStyle } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { invariant } from "@zag-js/utils"
import { parts } from "./pin-input.anatomy"
import { dom } from "./pin-input.dom"
import type { MachineApi, Send, State } from "./pin-input.types"
import { isValidValue } from "./pin-input.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const complete = state.context.isValueComplete
  const invalid = state.context.invalid
  const focusedIndex = state.context.focusedIndex
  const translations = state.context.translations

  function focus() {
    dom.getFirstInputEl(state.context)?.focus()
  }

  return {
    focus,
    value: state.context.value,
    valueAsString: state.context.valueAsString,
    complete: complete,
    setValue(value) {
      if (!Array.isArray(value)) {
        invariant("[pin-input/setValue] value must be an array")
      }
      send({ type: "VALUE.SET", value })
    },
    clearValue() {
      send({ type: "VALUE.CLEAR" })
    },
    setValueAtIndex(index, value) {
      send({ type: "VALUE.SET", value, index })
    },

    getRootProps() {
      return normalize.element({
        dir: state.context.dir,
        ...parts.root.attrs,
        id: dom.getRootId(state.context),
        "data-invalid": dataAttr(invalid),
        "data-disabled": dataAttr(state.context.disabled),
        "data-complete": dataAttr(complete),
        "data-readonly": dataAttr(state.context.readOnly),
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        dir: state.context.dir,
        htmlFor: dom.getHiddenInputId(state.context),
        id: dom.getLabelId(state.context),
        "data-invalid": dataAttr(invalid),
        "data-disabled": dataAttr(state.context.disabled),
        "data-complete": dataAttr(complete),
        "data-readonly": dataAttr(state.context.readOnly),
        onClick(event) {
          event.preventDefault()
          focus()
        },
      })
    },

    getHiddenInputProps() {
      return normalize.input({
        "aria-hidden": true,
        type: "text",
        tabIndex: -1,
        id: dom.getHiddenInputId(state.context),
        readOnly: state.context.readOnly,
        disabled: state.context.disabled,
        required: state.context.required,
        name: state.context.name,
        form: state.context.form,
        style: visuallyHiddenStyle,
        maxLength: state.context.valueLength,
        defaultValue: state.context.valueAsString,
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        dir: state.context.dir,
        id: dom.getControlId(state.context),
      })
    },

    getInputProps(props) {
      const { index } = props
      const inputType = state.context.type === "numeric" ? "tel" : "text"
      return normalize.input({
        ...parts.input.attrs,
        dir: state.context.dir,
        disabled: state.context.disabled,
        "data-disabled": dataAttr(state.context.disabled),
        "data-complete": dataAttr(complete),
        id: dom.getInputId(state.context, index.toString()),
        "data-ownedby": dom.getRootId(state.context),
        "aria-label": translations.inputLabel(index, state.context.valueLength),
        inputMode: state.context.otp || state.context.type === "numeric" ? "numeric" : "text",
        "aria-invalid": ariaAttr(invalid),
        "data-invalid": dataAttr(invalid),
        type: state.context.mask ? "password" : inputType,
        defaultValue: state.context.value[index] || "",
        readOnly: state.context.readOnly,
        autoCapitalize: "none",
        autoComplete: state.context.otp ? "one-time-code" : "off",
        placeholder: focusedIndex === index ? "" : state.context.placeholder,
        onBeforeInput(event) {
          try {
            const value = getBeforeInputValue(event)
            const isValid = isValidValue(state.context, value)
            if (!isValid) {
              send({ type: "VALUE.INVALID", value })
              event.preventDefault()
            }

            // select the text so paste always replaces the
            // current input's value regardless of cursor position
            if (value.length > 2) {
              event.currentTarget.setSelectionRange(0, 1, "forward")
            }
          } catch {
            // noop
          }
        },
        onChange(event) {
          const evt = getNativeEvent(event)
          const { value } = event.currentTarget

          if (evt.inputType === "insertFromPaste" || value.length > 2) {
            send({ type: "INPUT.PASTE", value })
            // prevent multiple characters being pasted
            // into a single input
            event.target.value = value[0]

            event.preventDefault()
            return
          }

          if (evt.inputType === "deleteContentBackward") {
            send("INPUT.BACKSPACE")
            return
          }

          send({ type: "INPUT.CHANGE", value, index })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return

          if (isComposingEvent(event)) return
          if (isModifierKey(event)) return

          const keyMap: EventKeyMap = {
            Backspace() {
              send("INPUT.BACKSPACE")
            },
            Delete() {
              send("INPUT.DELETE")
            },
            ArrowLeft() {
              send("INPUT.ARROW_LEFT")
            },
            ArrowRight() {
              send("INPUT.ARROW_RIGHT")
            },
            Enter() {
              send("INPUT.ENTER")
            },
          }

          const exec = keyMap[getEventKey(event, state.context)]

          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
        onFocus() {
          send({ type: "INPUT.FOCUS", index })
        },
        onBlur() {
          send({ type: "INPUT.BLUR", index })
        },
      })
    },
  }
}
