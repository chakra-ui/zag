import { dataAttr, EventKeyMap, getEventStep, getNativeEvent } from "@ui-machines/dom-utils"
import { multiply, roundToPx } from "@ui-machines/number-utils"
import { getEventPoint } from "@ui-machines/rect-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./number-input.dom"
import { Send, State } from "./number-input.types"
import { utils } from "./number-input.utils"

export function connect<T extends PropTypes = ReactPropTypes>(state: State, send: Send, normalize = normalizeProp) {
  const { context: ctx } = state

  const isScrubbing = state.matches("scrubbing")
  const isFocused = state.matches("focused", "before:spin", "scrubbing", "spinning")
  const isInvalid = ctx.isOutOfRange || Boolean(ctx.invalid)

  return {
    // properties
    valueAsNumber: ctx.valueAsNumber,
    value: ctx.formattedValue,
    canIncrement: ctx.canIncrement,
    canDecrement: ctx.canDecrement,
    isScrubbing,
    isFocused,
    isDisabled: ctx.disabled,
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
      dom.getInputEl(ctx)?.blur()
    },
    focus() {
      dom.getInputEl(ctx)?.focus()
    },

    // properties
    labelProps: normalize.label<T>({
      "data-part": "label",
      "data-disabled": dataAttr(ctx.disabled),
      "data-readonly": dataAttr(ctx.readonly),
      "data-invalid": dataAttr(isInvalid),
      id: dom.getLabelId(ctx),
      htmlFor: dom.getInputId(ctx),
    }),

    inputProps: normalize.input<T>({
      "data-part": "input",
      name: ctx.name,
      id: dom.getInputId(ctx),
      role: "spinbutton",
      pattern: ctx.pattern,
      inputMode: ctx.inputMode,
      disabled: ctx.disabled,
      readOnly: ctx.readonly,
      autoComplete: "off",
      autoCorrect: "off",
      type: "text",
      "aria-valuemin": ctx.min,
      "aria-valuemax": ctx.max,
      "aria-valuetext": ctx.ariaValueText || undefined,
      "aria-valuenow": isNaN(ctx.valueAsNumber) ? undefined : ctx.valueAsNumber,
      "aria-invalid": isInvalid || undefined,
      "data-invalid": dataAttr(isInvalid),
      "aria-disabled": ctx.disabled || undefined,
      "data-disabled": dataAttr(ctx.disabled),
      "aria-readonly": ctx.readonly || undefined,
      value: ctx.value,
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
        if (!utils.isValidNumericEvent(ctx, event)) {
          event.preventDefault()
        }

        const step = multiply(getEventStep(event), ctx.step)
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
      id: dom.getDecButtonId(ctx),
      "aria-disabled": !ctx.canDecrement,
      "data-disabled": dataAttr(!ctx.canDecrement),
      "aria-label": "Decrement value",
      disabled: !ctx.canDecrement,
      role: "button",
      tabIndex: -1,
      onPointerDown(event) {
        if (!ctx.canDecrement) return
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
      id: dom.getIncButtonId(ctx),
      "aria-disabled": !ctx.canIncrement,
      "data-disabled": dataAttr(!ctx.canIncrement),
      "aria-label": "Increment value",
      disabled: !ctx.canIncrement,
      role: "button",
      tabIndex: -1,
      onPointerDown(event) {
        event.preventDefault()
        if (!ctx.canIncrement) return
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
      id: dom.getScrubberId(ctx),
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
