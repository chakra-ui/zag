import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/prop-types"
import { fromPointerEvent } from "tiny-point/dom"
import { dataAttr, DOM, getEventStep } from "../utils"
import { cast } from "../utils/fn"
import { roundPx } from "../utils/number"
import { dom } from "./number-input.dom"
import { NumberInputSend, NumberInputState } from "./number-input.types"
import { utils } from "./number-input.utils"

export function numberInputConnect<T extends PropTypes = ReactPropTypes>(
  state: NumberInputState,
  send: NumberInputSend,
  normalize = normalizeProp,
) {
  const { context: ctx } = state

  const isScrubbing = state.matches("scrubbing")
  const isFocused = state.matches("focused", "before:spin", "scrubbing", "spinning")
  const isInvalid = ctx.isOutOfRange || Boolean(ctx.invalid)

  return {
    valueAsNumber: ctx.valueAsNumber,
    value: ctx.formattedValue,

    isScrubbing,
    isFocused,
    isDisabled: ctx.disabled,
    isInvalid,

    labelProps: normalize.label<T>({
      "data-disabled": dataAttr(ctx.disabled),
      "data-readonly": dataAttr(ctx.readonly),
      "data-invalid": dataAttr(isInvalid),
      id: dom.getLabelId(ctx),
      htmlFor: dom.getInputId(ctx),
    }),

    inputProps: normalize.input<T>({
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
      "aria-disabled": ctx.disabled || undefined,
      "aria-readonly": ctx.readonly || undefined,
      value: ctx.value,
      onFocus() {
        send("FOCUS")
      },
      onBlur() {
        send("BLUR")
      },
      onChange(event) {
        const evt = (event.nativeEvent ?? event) as InputEvent
        if (evt.isComposing) return
        send({ type: "CHANGE", target: event.currentTarget, hint: "set" })
      },
      onKeyDown(event) {
        const evt = (event.nativeEvent ?? event) as KeyboardEvent
        if (evt.isComposing) return

        if (!utils.isValidNumericEvent(ctx, event)) {
          event.preventDefault()
        }

        const step = getEventStep(event) * ctx.step
        const keyMap: DOM.EventKeyMap = {
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
          event.preventDefault()
          exec(event)
        }
      },
    }),

    decrementButtonProps: normalize.button<T>({
      id: dom.getDecButtonId(ctx),
      "aria-disabled": !ctx.canDecrement,
      "aria-label": "Decrement value",
      disabled: !ctx.canDecrement,
      role: "button",
      tabIndex: -1,
      onPointerDown(event) {
        event.preventDefault()
        if (!ctx.canDecrement) return
        send({ type: "PRESS_DOWN", hint: "decrement" })
      },
      onPointerUp() {
        send({ type: "PRESS_UP", hint: "decrement" })
      },
      onPointerLeave() {
        send({ type: "PRESS_UP", hint: "decrement" })
      },
    }),

    incrementButtonProps: normalize.button<T>({
      id: dom.getIncButtonId(ctx),
      "aria-disabled": !ctx.canIncrement,
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
      id: dom.getScrubberId(ctx),
      role: "presentation",
      onMouseDown(event) {
        event.preventDefault()
        const pt = fromPointerEvent(cast(event))
        const win = cast<Window>(event.view ?? window)
        const dp = win.devicePixelRatio
        send({
          type: "PRESS_DOWN_SCRUBBER",
          point: { x: pt.x - roundPx(7.5, dp), y: pt.y - roundPx(7.5, dp) },
        })
      },
      style: {
        cursor: "ew-resize",
      },
    }),
  }
}
