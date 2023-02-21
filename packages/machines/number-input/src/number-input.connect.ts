import { EventKeyMap, getEventStep, getNativeEvent, isLeftClick } from "@zag-js/dom-event"
import { roundToDevicePixel } from "@zag-js/number-utils"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./number-input.anatomy"
import { dom } from "./number-input.dom"
import type { Send, State } from "./number-input.types"
import { utils } from "./number-input.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isFocused = state.hasTag("focus")
  const isInvalid = state.context.isOutOfRange || !!state.context.invalid

  const isDisabled = !!state.context.disabled
  const isValueEmpty = state.context.isValueEmpty
  const isIncrementDisabled = isDisabled || !state.context.canIncrement
  const isDecrementDisabled = isDisabled || !state.context.canDecrement

  const translations = state.context.translations

  return {
    isFocused,
    isInvalid,
    isValueEmpty,
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
    blur() {
      dom.getInputEl(state.context)?.blur()
    },

    rootProps: normalize.element({
      id: dom.getRootId(state.context),
      ...parts.root.attrs,
      "data-disabled": isDisabled || undefined,
    }),

    labelProps: normalize.label({
      ...parts.label.attrs,
      "data-disabled": isDisabled || undefined,
      "data-invalid": isInvalid || undefined,
      id: dom.getLabelId(state.context),
      htmlFor: dom.getInputId(state.context),
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      role: "group",
      "aria-disabled": isDisabled,
      "data-disabled": isDisabled || undefined,
      "data-invalid": isInvalid || undefined,
      "aria-invalid": state.context.invalid || undefined,
    }),

    inputProps: normalize.input({
      ...parts.input.attrs,
      name: state.context.name,
      form: state.context.form,
      id: dom.getInputId(state.context),
      role: "spinbutton",
      defaultValue: state.context.formattedValue,
      pattern: state.context.pattern,
      inputMode: state.context.inputMode,
      "aria-invalid": isInvalid || undefined,
      "data-invalid": isInvalid || undefined,
      disabled: isDisabled,
      "data-disabled": isDisabled || undefined,
      readOnly: !!state.context.readOnly,
      autoComplete: "off",
      autoCorrect: "off",
      spellCheck: "false",
      type: "text",
      "aria-roledescription": "numberfield",
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

    decrementTriggerProps: normalize.button({
      ...parts.decrementTrigger.attrs,
      id: dom.getDecrementTriggerId(state.context),
      disabled: isDecrementDisabled,
      "data-disabled": isDecrementDisabled || undefined,
      "aria-label": translations.decrementLabel,
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

    incrementTriggerProps: normalize.button({
      ...parts.incrementTrigger.attrs,
      id: dom.getIncrementTriggerId(state.context),
      disabled: isIncrementDisabled,
      "data-disabled": isIncrementDisabled || undefined,
      "aria-label": translations.incrementLabel,
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
      ...parts.scrubber.attrs,
      "data-disabled": isDisabled || undefined,
      id: dom.getScrubberId(state.context),
      role: "presentation",
      onMouseDown(event) {
        if (isDisabled) return
        const evt = getNativeEvent(event)
        event.preventDefault()
        const point = { x: evt.clientX, y: evt.clientY }

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
