import {
  ariaAttr,
  dataAttr,
  EventKeyMap,
  getEventStep,
  getNativeEvent,
  getEventPoint,
  isIos,
  isLeftClick,
} from "@zag-js/dom-utils"
import { roundToDevicePixel } from "@zag-js/number-utils"
import type { NormalizeProps, PropTypes } from "@zag-js/types"

import { dom } from "./number-input.dom"
import type { Send, State } from "./number-input.types"
import { utils } from "./number-input.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isFocused = state.hasTag("focus")
  const isInvalid = state.context.isOutOfRange || !!state.context.invalid

  const isDisabled = !!state.context.disabled
  const isIncrementDisabled = isDisabled || !state.context.canIncrement
  const isDecrementDisabled = isDisabled || !state.context.canDecrement

  const messages = state.context.messages

  return {
    isFocused,
    isInvalid,
    value: state.context.formattedValue,
    valueAsNumber: state.context.valueAsNumber,
    setValue(value: string | number) {
      send({ type: "SET_VALUE", value: value.toString() })
    },
    clearValue() {
      send("CLEAR_VALUE")
    },
    increment() {
      send("INCREMENT")
    },
    decrement() {
      send("DECREMENT")
    },
    setToMax() {
      send({ type: "SET_VALUE", value: state.context.max })
    },
    setToMin() {
      send({ type: "SET_VALUE", value: state.context.min })
    },
    focus() {
      dom.getInputEl(state.context)?.focus()
    },

    rootProps: normalize.element({
      id: dom.getRootId(state.context),
      "data-part": "root",
      "data-disabled": dataAttr(isDisabled),
    }),

    labelProps: normalize.label({
      "data-part": "label",
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      id: dom.getLabelId(state.context),
      htmlFor: dom.getInputId(state.context),
    }),

    groupProps: normalize.element({
      "data-part": "group",
      role: "group",
      "aria-disabled": isDisabled,
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "aria-invalid": ariaAttr(state.context.invalid),
    }),

    inputProps: normalize.input({
      "data-part": "input",
      name: state.context.name,
      id: dom.getInputId(state.context),
      role: "spinbutton",
      value: state.context.formattedValue,
      pattern: state.context.pattern,
      inputMode: state.context.inputMode,
      "aria-invalid": isInvalid || undefined,
      "data-invalid": dataAttr(isInvalid),
      disabled: isDisabled,
      "data-disabled": dataAttr(isDisabled),
      readOnly: !!state.context.readonly,
      autoComplete: "off",
      autoCorrect: "off",
      spellCheck: "false",
      type: "text",
      "aria-roledescription": !isIos() ? "number field" : undefined,
      "aria-valuemin": state.context.min,
      "aria-valuemax": state.context.max,
      "aria-valuenow": isNaN(state.context.valueAsNumber) ? undefined : state.context.valueAsNumber,
      "aria-valuetext": state.context.valueText,
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

        const step = getEventStep(event) * state.context.step

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

    decrementButtonProps: normalize.button({
      "data-part": "spin-button",
      "data-type": "decrement",
      id: dom.getDecButtonId(state.context),
      disabled: isDecrementDisabled,
      "data-disabled": dataAttr(isDecrementDisabled),
      "aria-label": messages.decrementLabel,
      type: "button",
      tabIndex: -1,
      "aria-controls": dom.getInputId(state.context),
      onPointerDown(event) {
        if (isDecrementDisabled) return
        send(isLeftClick(event) ? { type: "PRESS_DOWN", hint: "decrement" } : { type: "FOCUS" })
        event.preventDefault()
      },
      onPointerUp() {
        send({ type: "PRESS_UP", hint: "decrement" })
      },
      onPointerLeave() {
        if (isDecrementDisabled) return
        send({ type: "PRESS_UP", hint: "decrement" })
      },
    }),

    incrementButtonProps: normalize.button({
      "data-part": "spin-button",
      "data-type": "increment",
      id: dom.getIncButtonId(state.context),
      disabled: isIncrementDisabled,
      "data-disabled": dataAttr(isIncrementDisabled),
      "aria-label": messages.incrementLabel,
      type: "button",
      tabIndex: -1,
      "aria-controls": dom.getInputId(state.context),
      onPointerDown(event) {
        if (isIncrementDisabled) return
        send(isLeftClick(event) ? { type: "PRESS_DOWN", hint: "increment" } : { type: "FOCUS" })
        event.preventDefault()
      },
      onPointerUp() {
        send({ type: "PRESS_UP", hint: "increment" })
      },
      onPointerLeave() {
        send({ type: "PRESS_UP", hint: "increment" })
      },
    }),

    scrubberProps: normalize.element({
      "data-disabled": dataAttr(isDisabled),
      "data-part": "scrubber",
      id: dom.getScrubberId(state.context),
      role: "presentation",
      onMouseDown(event) {
        if (isDisabled) return
        const evt = getNativeEvent(event)
        event.preventDefault()
        const point = getEventPoint(evt)

        point.x = point.x - roundToDevicePixel(7.5)
        point.y = point.y - roundToDevicePixel(7.5)

        send({ type: "PRESS_DOWN_SCRUBBER", point })
      },
      style: {
        cursor: isDisabled ? undefined : "ew-resize",
      },
    }),
  }
}
