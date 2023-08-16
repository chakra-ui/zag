import { getEventKey, getNativeEvent, isModifiedEvent, type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { invariant } from "@zag-js/utils"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import { parts } from "./pin-input.anatomy"
import { dom } from "./pin-input.dom"
import type { MachineApi, Send, State } from "./pin-input.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isValueComplete = state.context.isValueComplete
  const isInvalid = state.context.invalid
  const focusedIndex = state.context.focusedIndex
  const translations = state.context.translations

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
