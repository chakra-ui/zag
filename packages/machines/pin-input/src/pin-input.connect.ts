import type { Service } from "@zag-js/core"
import {
  ariaAttr,
  dataAttr,
  getBeforeInputValue,
  getEventKey,
  getNativeEvent,
  isComposingEvent,
  isModifierKey,
  visuallyHiddenStyle,
} from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { invariant } from "@zag-js/utils"
import { parts } from "./pin-input.anatomy"
import * as dom from "./pin-input.dom"
import type { PinInputApi, PinInputSchema } from "./pin-input.types"
import { isValidValue } from "./pin-input.utils"

export function connect<T extends PropTypes>(
  service: Service<PinInputSchema>,
  normalize: NormalizeProps<T>,
): PinInputApi<T> {
  const { send, context, computed, prop, scope } = service

  const complete = computed("isValueComplete")
  const invalid = prop("invalid")
  const translations = prop("translations")
  const focusedIndex = context.get("focusedIndex")

  function focus() {
    dom.getFirstInputEl(scope)?.focus()
  }

  return {
    focus,
    value: context.get("value"),
    valueAsString: computed("valueAsString"),
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
        dir: prop("dir"),
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        "data-invalid": dataAttr(invalid),
        "data-disabled": dataAttr(prop("disabled")),
        "data-complete": dataAttr(complete),
        "data-readonly": dataAttr(prop("readOnly")),
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        dir: prop("dir"),
        htmlFor: dom.getHiddenInputId(scope),
        id: dom.getLabelId(scope),
        "data-invalid": dataAttr(invalid),
        "data-disabled": dataAttr(prop("disabled")),
        "data-complete": dataAttr(complete),
        "data-readonly": dataAttr(prop("readOnly")),
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
        id: dom.getHiddenInputId(scope),
        readOnly: prop("readOnly"),
        disabled: prop("disabled"),
        required: prop("required"),
        name: prop("name"),
        form: prop("form"),
        style: visuallyHiddenStyle,
        maxLength: computed("valueLength"),
        defaultValue: computed("valueAsString"),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        dir: prop("dir"),
        id: dom.getControlId(scope),
      })
    },

    getInputProps(props) {
      const { index } = props
      const inputType = prop("type") === "numeric" ? "tel" : "text"
      return normalize.input({
        ...parts.input.attrs,
        dir: prop("dir"),
        disabled: prop("disabled"),
        "data-disabled": dataAttr(prop("disabled")),
        "data-complete": dataAttr(complete),
        id: dom.getInputId(scope, index.toString()),
        "data-ownedby": dom.getRootId(scope),
        "aria-label": translations?.inputLabel?.(index, computed("valueLength")),
        inputMode: prop("otp") || prop("type") === "numeric" ? "numeric" : "text",
        "aria-invalid": ariaAttr(invalid),
        "data-invalid": dataAttr(invalid),
        type: prop("mask") ? "password" : inputType,
        defaultValue: context.get("value")[index] || "",
        readOnly: prop("readOnly"),
        autoCapitalize: "none",
        autoComplete: prop("otp") ? "one-time-code" : "off",
        placeholder: focusedIndex === index ? "" : prop("placeholder"),
        onBeforeInput(event) {
          try {
            const value = getBeforeInputValue(event)
            const isValid = isValidValue(value, prop("type"), prop("pattern"))
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
            event.currentTarget.value = value[0]

            event.preventDefault()
            return
          }

          if (evt.inputType === "deleteContentBackward") {
            send({ type: "INPUT.BACKSPACE" })
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
              send({ type: "INPUT.BACKSPACE" })
            },
            Delete() {
              send({ type: "INPUT.DELETE" })
            },
            ArrowLeft() {
              send({ type: "INPUT.ARROW_LEFT" })
            },
            ArrowRight() {
              send({ type: "INPUT.ARROW_RIGHT" })
            },
            Enter() {
              send({ type: "INPUT.ENTER" })
            },
          }

          const exec =
            keyMap[
              getEventKey(event, {
                dir: prop("dir"),
                orientation: "horizontal",
              })
            ]

          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
        onFocus() {
          queueMicrotask(() => {
            send({ type: "INPUT.FOCUS", index })
          })
        },
        onBlur() {
          send({ type: "INPUT.BLUR", index })
        },
      })
    },
  }
}
