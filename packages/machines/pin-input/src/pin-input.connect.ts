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
import type { InputProps, InputState, LabelState, PinInputApi, PinInputSchema, RootState } from "./pin-input.types"
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

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getInputState(props: InputProps): InputState {
    const { index } = props
    const valueLength = computed("valueLength")
    const tabbableIndex = focusedIndex !== -1 ? focusedIndex : Math.min(computed("filledValueLength"), valueLength - 1)
    return {
      index,
      disabled,
      readOnly,
      invalid,
      complete,
      filled: computed("_value")[index] !== "",
      focused: focusedIndex === index,
      tabbable: index === tabbableIndex,
    }
  }

  function getRootState(): RootState {
    return { invalid, disabled, complete, readOnly }
  }

  function getLabelState(): LabelState {
    return { invalid, disabled, complete, required, readOnly }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    focus,
    count: prop("count")!,
    items: Array.from({ length: prop("count")! }).map((_, i) => i),
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

    getRootState,
    getRootProps() {
      const rootState = getRootState()
      return normalize.element({
        dir: prop("dir"),
        ...parts.root.attrs(scope.id),
        "data-invalid": dataAttr(rootState.invalid),
        "data-disabled": dataAttr(rootState.disabled),
        "data-complete": dataAttr(rootState.complete),
        "data-readonly": dataAttr(rootState.readOnly),
      })
    },

    getLabelState,
    getLabelProps() {
      const labelState = getLabelState()
      return normalize.label({
        ...parts.label.attrs(scope.id),
        dir: prop("dir"),
        htmlFor: dom.getHiddenInputId(scope),
        id: dom.getLabelId(scope),
        "data-invalid": dataAttr(labelState.invalid),
        "data-disabled": dataAttr(labelState.disabled),
        "data-complete": dataAttr(labelState.complete),
        "data-required": dataAttr(labelState.required),
        "data-readonly": dataAttr(labelState.readOnly),
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
        ...parts.control.attrs(scope.id),
        dir: prop("dir"),
      })
    },

    getInputState,
    getInputProps(props) {
      const { index } = props
      const inputState = getInputState(props)
      const inputType = prop("type") === "numeric" ? "tel" : "text"
      const valueLength = computed("valueLength")
      return normalize.input({
        ...parts.input.attrs(scope.id),
        dir: prop("dir"),
        disabled: inputState.disabled,
        tabIndex: inputState.tabbable ? 0 : -1,
        "data-disabled": dataAttr(inputState.disabled),
        "data-complete": dataAttr(inputState.complete),
        "data-filled": dataAttr(inputState.filled),
        id: dom.getInputId(scope, index.toString()),
        "data-index": index,
        "aria-label": translations?.inputLabel?.(index, computed("valueLength")),
        inputMode: prop("otp") || prop("type") === "numeric" ? "numeric" : "text",
        "aria-invalid": ariaAttr(inputState.invalid),
        "data-invalid": dataAttr(inputState.invalid),
        enterKeyHint: index === valueLength - 1 ? "done" : "next",
        type: prop("mask") ? "password" : inputType,
        defaultValue: computed("_value")[index] || "",
        readOnly: inputState.readOnly,
        autoCapitalize: "none",
        autoComplete: prop("otp") ? "one-time-code" : "off",
        placeholder: inputState.focused ? "" : prop("placeholder"),
        onPaste(event) {
          let pastedValue = event.clipboardData?.getData("text/plain")
          if (!pastedValue) return

          const transformer = prop("sanitizeValue")
          if (transformer) pastedValue = transformer(pastedValue)

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
          if (evt.inputType === "deleteByCut") {
            send({ type: "INPUT.DELETE" })
            return
          }
          if (value === computed("focusedValue")) return

          send({ type: "INPUT.CHANGE", value, index })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return

          if (isComposingEvent(event)) return
          if (isModifierKey(event)) return

          // Same key already in slot: advance focus without changing value
          if (event.key.length === 1 && computed("focusedValue") === event.key) {
            event.preventDefault()
            send({ type: "INPUT.ADVANCE" })
            return
          }

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
            Home() {
              send({ type: "INPUT.HOME" })
            },
            End() {
              send({ type: "INPUT.END" })
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
