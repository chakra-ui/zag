import { fromPointerEvent } from "tiny-point/dom"
import { defaultPropNormalizer, DOM, getEventStep, Props } from "../utils"
import { cast } from "../utils/fn"
import { dom } from "./number-input.dom"
import { NumberInputSend, NumberInputState } from "./number-input.types"
import { utils } from "./number-input.utils"

export function numberInputConnect(state: NumberInputState, send: NumberInputSend, normalize = defaultPropNormalizer) {
  const { context: ctx } = state

  const isScrubbing = state.matches("scrubbing")
  const isFocused = state.matches("focused", "before:spin", "scrubbing", "spinning")

  return {
    valueAsNumber: ctx.valueAsNumber,
    value: ctx.formattedValue,

    isScrubbing,
    isFocused,
    isDisabled: ctx.disabled,

    inputProps: normalize<Props.Input>({
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
      "aria-valuetext": ctx.ariaValueText,
      "aria-valuenow": isNaN(ctx.valueAsNumber) ? undefined : ctx.valueAsNumber,
      "aria-invalid": ctx.isOutOfRange || undefined,
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

    decrementButtonProps: normalize<Props.Button>({
      id: dom.getDecButtonId(ctx),
      "aria-disabled": !ctx.canDecrement,
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

    incrementButtonProps: normalize<Props.Button>({
      "aria-disabled": !ctx.canIncrement,
      disabled: !ctx.canIncrement,
      role: "button",
      tabIndex: -1,
      id: dom.getIncButtonId(ctx),
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

    cursorProps: normalize<Props.Element>({
      hidden: !ctx.showScrubber,
      style: {
        position: "fixed",
        pointerEvents: "none",
        left: "0px",
        top: "0px",
        zIndex: 99999,
        transform: ctx.scrubberPoint
          ? `translate3d(${ctx.scrubberPoint.x}px, ${ctx.scrubberPoint.y}px, 0px)`
          : undefined,
        willChange: "transform",
      },
    }),

    scrubberProps: normalize<Props.Element>({
      id: dom.getScrubberId(ctx),
      role: "presentation",
      onMouseDown(event) {
        event.preventDefault()
        send({ type: "PRESS_DOWN_SCRUBBER", point: fromPointerEvent(cast(event)) })
      },
      style: {
        cursor: "ew-resize",
      },
    }),
  }
}
