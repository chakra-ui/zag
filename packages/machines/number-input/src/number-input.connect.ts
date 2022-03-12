import { dataAttr, EventKeyMap, getEventStep, getNativeEvent } from "@ui-machines/dom-utils"
import { multiply, roundToPx } from "@ui-machines/number-utils"
import { getEventPoint } from "@ui-machines/rect-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./number-input.dom"
import { Send, State } from "./number-input.types"
import { utils } from "./number-input.utils"

export function connect<T extends PropTypes = ReactPropTypes>(state: State, send: Send, normalize = normalizeProp) {
  const isScrubbing = state.matches("scrubbing")
  const isFocused = state.hasTag("focus")
  const isInvalid = state.context.isOutOfRange || Boolean(state.context.invalid)

  return {
    // properties
    valueAsNumber: state.context.valueAsNumber,
    value: state.context.formattedValue,
    canIncrement: state.context.canIncrement,
    canDecrement: state.context.canDecrement,
    isScrubbing,
    isFocused,
    isDisabled: state.context.disabled,
    isInvalid,

    // methods
    setValue(value: string | number) {
      send({ type: "SET_VALUE", value: value.toString() })
    },
    clear() {
      send("CLEAR_VALUE")
    },
    increment() {
      send("INCREMENT")
    },
    decrement() {
      send("DECREMENT")
    },
    setToMax() {
      send("SET_TO_MAX")
    },
    setToMin() {
      send("SET_TO_MIN")
    },
    blur() {
      dom.getInputEl(state.context)?.blur()
    },
    focus() {
      dom.getInputEl(state.context)?.focus()
    },

    // properties
    labelProps: normalize.label<T>({
      "data-part": "label",
      "data-disabled": dataAttr(state.context.disabled),
      "data-readonly": dataAttr(state.context.readonly),
      "data-invalid": dataAttr(isInvalid),
      id: dom.getLabelId(state.context),
      htmlFor: dom.getInputId(state.context),
    }),

    inputProps: normalize.input<T>({
      "data-part": "input",
      name: state.context.name,
      id: dom.getInputId(state.context),
      role: "spinbutton",
      pattern: state.context.pattern,
      inputMode: state.context.inputMode,
      disabled: state.context.disabled,
      readOnly: state.context.readonly,
      autoComplete: "off",
      autoCorrect: "off",
      type: "text",
      "aria-valuemin": state.context.min,
      "aria-valuemax": state.context.max,
      "aria-valuetext": state.context.ariaValueText || undefined,
      "aria-valuenow": isNaN(state.context.valueAsNumber) ? undefined : state.context.valueAsNumber,
      "aria-invalid": isInvalid || undefined,
      "data-invalid": dataAttr(isInvalid),
      "aria-disabled": state.context.disabled || undefined,
      "data-disabled": dataAttr(state.context.disabled),
      "aria-readonly": state.context.readonly || undefined,
      value: state.context.value,
      onFocus() {
        send("FOCUS")
      },
      onBlur() {
        send("BLUR")
      },
      onChange(event) {
        const evt = getNativeEvent(event)
        if (evt.isComposing) return
        send({ type: "CHANGE", target: event.currentTarget, hint: "set" })
      },
      onKeyDown(event) {
        const evt = getNativeEvent(event)
        if (evt.isComposing) return
        if (!utils.isValidNumericEvent(state.context, event)) {
          event.preventDefault()
        }

        const step = multiply(getEventStep(event), state.context.step)
        const keyMap: EventKeyMap = {
          ArrowUp() {
            send({ type: "ARROW_UP", step })
          },
          ArrowDown() {
            send({ type: "ARROW_DOWN", step })
          },
          Home() {
            send("HOME")
          },
          End() {
            send("END")
          },
        }

        const exec = keyMap[event.key]

        if (exec) {
          exec(event)
          event.preventDefault()
        }
      },
    }),

    decrementButtonProps: normalize.button<T>({
      "data-part": "spinner-button",
      id: dom.getDecButtonId(state.context),
      "aria-disabled": !state.context.canDecrement,
      "data-disabled": dataAttr(!state.context.canDecrement),
      "aria-label": "Decrement value",
      disabled: !state.context.canDecrement,
      role: "button",
      tabIndex: -1,
      onPointerDown(event) {
        if (!state.context.canDecrement) return
        send({ type: "PRESS_DOWN", hint: "decrement" })
        event.preventDefault()
      },
      onPointerUp() {
        send({ type: "PRESS_UP", hint: "decrement" })
      },
      onPointerLeave() {
        send({ type: "PRESS_UP", hint: "decrement" })
      },
    }),

    incrementButtonProps: normalize.button<T>({
      "data-part": "spinner-button",
      id: dom.getIncButtonId(state.context),
      "aria-disabled": !state.context.canIncrement,
      "data-disabled": dataAttr(!state.context.canIncrement),
      "aria-label": "Increment value",
      disabled: !state.context.canIncrement,
      role: "button",
      tabIndex: -1,
      onPointerDown(event) {
        event.preventDefault()
        if (!state.context.canIncrement) return
        send({ type: "PRESS_DOWN", hint: "increment" })
      },
      onPointerUp() {
        send({ type: "PRESS_UP", hint: "increment" })
      },
      onPointerLeave() {
        send({ type: "PRESS_UP", hint: "increment" })
      },
    }),

    scrubberProps: normalize.element<T>({
      "data-part": "scrubber",
      id: dom.getScrubberId(state.context),
      role: "presentation",
      onMouseDown(event) {
        const evt = getNativeEvent(event)
        event.preventDefault()
        const point = getEventPoint(evt)

        point.x = point.x - roundToPx(7.5)
        point.y = point.y - roundToPx(7.5)

        send({ type: "PRESS_DOWN_SCRUBBER", point })
      },
      style: {
        cursor: "ew-resize",
      },
    }),
  }
}
