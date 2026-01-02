import type { Service } from "@zag-js/core"
import {
  ariaAttr,
  dataAttr,
  getBeforeInputValue,
  getEventKey,
  getNativeEvent,
  isComposingEvent,
  isHTMLElement,
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
  const disabled = !!prop("disabled")
  const readOnly = !!prop("readOnly")
  const invalid = !!prop("invalid")
  const required = !!prop("required")
  const translations = prop("translations")
  const focusedIndex = context.get("focusedIndex")

  function focus() {
    dom.getFirstInputEl(scope)?.focus()
  }

  return {
    focus,
    count: context.get("count"),
    items: Array.from({ length: context.get("count") }).map((_, i) => i),
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
        "data-disabled": dataAttr(disabled),
        "data-complete": dataAttr(complete),
        "data-readonly": dataAttr(readOnly),
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        dir: prop("dir"),
        htmlFor: dom.getHiddenInputId(scope),
        id: dom.getLabelId(scope),
        "data-invalid": dataAttr(invalid),
        "data-disabled": dataAttr(disabled),
        "data-complete": dataAttr(complete),
        "data-required": dataAttr(required),
        "data-readonly": dataAttr(readOnly),
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
        readOnly,
        disabled,
        required,
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
        disabled,
        "data-disabled": dataAttr(disabled),
        "data-complete": dataAttr(complete),
        id: dom.getInputId(scope, index.toString()),
        "data-index": index,
        "data-ownedby": dom.getRootId(scope),
        "aria-label": translations?.inputLabel?.(index, computed("valueLength")),
        inputMode: prop("otp") || prop("type") === "numeric" ? "numeric" : "text",
        "aria-invalid": ariaAttr(invalid),
        "data-invalid": dataAttr(invalid),
        type: prop("mask") ? "password" : inputType,
        defaultValue: context.get("value")[index] || "",
        readOnly,
        autoCapitalize: "none",
        autoComplete: prop("otp") ? "one-time-code" : "off",
        placeholder: focusedIndex === index ? "" : prop("placeholder"),
        onPaste(event) {
          const pastedValue = event.clipboardData?.getData("text/plain")
          if (!pastedValue) return

          const isValid = isValidValue(pastedValue, prop("type"), prop("pattern"))
          if (!isValid) {
            send({ type: "VALUE.INVALID", value: pastedValue })
            event.preventDefault()
            return
          }

          // Send paste event with full clipboard data
          event.preventDefault()
          send({ type: "INPUT.PASTE", value: pastedValue })
        },
        onBeforeInput(event) {
          try {
            const value = getBeforeInputValue(event)
            const isValid = isValidValue(value, prop("type"), prop("pattern"))
            if (!isValid) {
              send({ type: "VALUE.INVALID", value })
              event.preventDefault()
            }

            // Select existing text so new input replaces it
            // This is needed because maxlength="1" would otherwise prevent new chars
            if (value.length > 1) {
              event.currentTarget.setSelectionRange(0, 1, "forward")
            }
          } catch {
            // noop
          }
        },
        onChange(event) {
          const evt = getNativeEvent(event)
          const { value } = event.currentTarget

          // Skip if this was a paste - already handled by onPaste
          if (evt.inputType === "insertFromPaste") {
            event.currentTarget.value = value[0] || ""
            return
          }

          if (value.length > 2) {
            send({ type: "INPUT.PASTE", value })
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
          send({ type: "INPUT.FOCUS", index })
        },
        onBlur(event) {
          const target = event.relatedTarget as HTMLElement
          if (isHTMLElement(target) && target.dataset.ownedby === dom.getRootId(scope)) return
          send({ type: "INPUT.BLUR", index })
        },
      })
    },
  }
}
