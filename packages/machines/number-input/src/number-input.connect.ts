import {
  ariaAttr,
  dataAttr,
  getEventPoint,
  getEventStep,
  getWindow,
  isComposingEvent,
  isLeftClick,
  isModifierKey,
} from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { roundToDpr } from "@zag-js/utils"
import { parts } from "./number-input.anatomy"
import * as dom from "./number-input.dom"
import type { NumberInputApi, NumberInputService } from "./number-input.types"

export function connect<T extends PropTypes>(
  service: NumberInputService,
  normalize: NormalizeProps<T>,
): NumberInputApi<T> {
  const { state, send, prop, scope, computed } = service

  const focused = state.hasTag("focus")
  const disabled = computed("isDisabled")
  const readOnly = prop("readOnly")
  const scrubbing = state.matches("scrubbing")

  const empty = computed("isValueEmpty")
  const invalid = computed("isOutOfRange") || !!prop("invalid")

  const isIncrementDisabled = disabled || !computed("canIncrement") || readOnly
  const isDecrementDisabled = disabled || !computed("canDecrement") || readOnly

  const translations = prop("translations")

  return {
    focused: focused,
    invalid: invalid,
    empty: empty,
    value: computed("formattedValue"),
    valueAsNumber: computed("valueAsNumber"),
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    clearValue() {
      send({ type: "VALUE.CLEAR" })
    },
    increment() {
      send({ type: "VALUE.INCREMENT" })
    },
    decrement() {
      send({ type: "VALUE.DECREMENT" })
    },
    setToMax() {
      send({ type: "VALUE.SET", value: prop("max") })
    },
    setToMin() {
      send({ type: "VALUE.SET", value: prop("min") })
    },
    focus() {
      dom.getInputEl(scope)?.focus()
    },

    getRootProps() {
      return normalize.element({
        id: dom.getRootId(scope),
        ...parts.root.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-focus": dataAttr(focused),
        "data-invalid": dataAttr(invalid),
        "data-scrubbing": dataAttr(scrubbing),
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-focus": dataAttr(focused),
        "data-invalid": dataAttr(invalid),
        "data-scrubbing": dataAttr(scrubbing),
        id: dom.getLabelId(scope),
        htmlFor: dom.getInputId(scope),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        dir: prop("dir"),
        role: "group",
        "aria-disabled": disabled,
        "data-focus": dataAttr(focused),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-scrubbing": dataAttr(scrubbing),
        "aria-invalid": ariaAttr(invalid),
      })
    },

    getValueTextProps() {
      return normalize.element({
        ...parts.valueText.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused),
        "data-scrubbing": dataAttr(scrubbing),
      })
    },

    getInputProps() {
      return normalize.input({
        ...parts.input.attrs,
        dir: prop("dir"),
        name: prop("name"),
        form: prop("form"),
        id: dom.getInputId(scope),
        role: "spinbutton",
        defaultValue: computed("formattedValue"),
        pattern: prop("formatOptions") ? undefined : prop("pattern"),
        inputMode: prop("inputMode"),
        "aria-invalid": ariaAttr(invalid),
        "data-invalid": dataAttr(invalid),
        disabled,
        "data-disabled": dataAttr(disabled),
        readOnly,
        required: prop("required"),
        autoComplete: "off",
        autoCorrect: "off",
        spellCheck: "false",
        type: "text",
        "aria-roledescription": "numberfield",
        "aria-valuemin": prop("min"),
        "aria-valuemax": prop("max"),
        "aria-valuenow": Number.isNaN(computed("valueAsNumber")) ? undefined : computed("valueAsNumber"),
        "aria-valuetext": computed("valueText"),
        "data-scrubbing": dataAttr(scrubbing),
        onFocus() {
          send({ type: "INPUT.FOCUS" })
        },
        onBlur() {
          send({ type: "INPUT.BLUR" })
        },
        onInput(event) {
          send({ type: "INPUT.CHANGE", target: event.currentTarget, hint: "set" })
        },
        onBeforeInput(event) {
          try {
            const { selectionStart, selectionEnd, value } = event.currentTarget

            const nextValue = value.slice(0, selectionStart!) + ((event as any).data ?? "") + value.slice(selectionEnd!)
            const isValid = computed("parser").isValidPartialNumber(nextValue)

            if (!isValid) {
              event.preventDefault()
            }
          } catch {
            // noop
          }
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (readOnly) return
          if (isComposingEvent(event)) return

          const step = getEventStep(event) * prop("step")

          const keyMap: EventKeyMap = {
            ArrowUp() {
              send({ type: "INPUT.ARROW_UP", step })
              event.preventDefault()
            },
            ArrowDown() {
              send({ type: "INPUT.ARROW_DOWN", step })
              event.preventDefault()
            },
            Home() {
              if (isModifierKey(event)) return
              send({ type: "INPUT.HOME" })
              event.preventDefault()
            },
            End() {
              if (isModifierKey(event)) return
              send({ type: "INPUT.END" })
              event.preventDefault()
            },
            Enter() {
              send({ type: "INPUT.ENTER" })
            },
          }

          const exec = keyMap[event.key]
          exec?.(event)
        },
      })
    },

    getDecrementTriggerProps() {
      return normalize.button({
        ...parts.decrementTrigger.attrs,
        dir: prop("dir"),
        id: dom.getDecrementTriggerId(scope),
        disabled: isDecrementDisabled,
        "data-disabled": dataAttr(isDecrementDisabled),
        "aria-label": translations.decrementLabel,
        type: "button",
        tabIndex: -1,
        "aria-controls": dom.getInputId(scope),
        "data-scrubbing": dataAttr(scrubbing),
        onPointerDown(event) {
          if (isDecrementDisabled) return
          if (!isLeftClick(event)) return
          send({ type: "TRIGGER.PRESS_DOWN", hint: "decrement", pointerType: event.pointerType })
          if (event.pointerType === "mouse") {
            event.preventDefault()
          }
          if (event.pointerType === "touch") {
            event.currentTarget?.focus({ preventScroll: true })
          }
        },
        onPointerUp(event) {
          send({ type: "TRIGGER.PRESS_UP", hint: "decrement", pointerType: event.pointerType })
        },
        onPointerLeave() {
          if (isDecrementDisabled) return
          send({ type: "TRIGGER.PRESS_UP", hint: "decrement" })
        },
      })
    },

    getIncrementTriggerProps() {
      return normalize.button({
        ...parts.incrementTrigger.attrs,
        dir: prop("dir"),
        id: dom.getIncrementTriggerId(scope),
        disabled: isIncrementDisabled,
        "data-disabled": dataAttr(isIncrementDisabled),
        "aria-label": translations.incrementLabel,
        type: "button",
        tabIndex: -1,
        "aria-controls": dom.getInputId(scope),
        "data-scrubbing": dataAttr(scrubbing),
        onPointerDown(event) {
          if (isIncrementDisabled || !isLeftClick(event)) return
          send({ type: "TRIGGER.PRESS_DOWN", hint: "increment", pointerType: event.pointerType })
          if (event.pointerType === "mouse") {
            event.preventDefault()
          }
          if (event.pointerType === "touch") {
            event.currentTarget?.focus({ preventScroll: true })
          }
        },
        onPointerUp(event) {
          send({ type: "TRIGGER.PRESS_UP", hint: "increment", pointerType: event.pointerType })
        },
        onPointerLeave(event) {
          send({ type: "TRIGGER.PRESS_UP", hint: "increment", pointerType: event.pointerType })
        },
      })
    },

    getScrubberProps() {
      return normalize.element({
        ...parts.scrubber.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        id: dom.getScrubberId(scope),
        role: "presentation",
        "data-scrubbing": dataAttr(scrubbing),
        onMouseDown(event) {
          if (disabled) return
          if (!isLeftClick(event)) return

          const point = getEventPoint(event)
          const win = getWindow(event.currentTarget)

          const dpr = win.devicePixelRatio
          point.x = point.x - roundToDpr(7.5, dpr)
          point.y = point.y - roundToDpr(7.5, dpr)

          send({ type: "SCRUBBER.PRESS_DOWN", point })
          event.preventDefault()
        },
        style: {
          cursor: disabled ? undefined : "ew-resize",
        },
      })
    },
  }
}
