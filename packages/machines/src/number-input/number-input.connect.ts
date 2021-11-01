import { StateMachine as S } from "@ui-machines/core"
import { range as createRange } from "tiny-num"
import { fromPointerEvent } from "tiny-point/dom"
import type { DOM, Props } from "../utils"
import { defaultPropNormalizer, getEventStep } from "../utils"
import { dom } from "./number-input.dom"
import { NumberInputMachineContext, NumberInputMachineState } from "./number-input.machine"
import { utils } from "./number-input.utils"

export function numberInputConnect(
  state: S.State<NumberInputMachineContext, NumberInputMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state

  const range = createRange(ctx)
  const canIncrement = !ctx.disabled && !range.isAtMax
  const canDecrement = !ctx.disabled && !range.isAtMin

  const valueAsNumber = range.value

  const MINUS_SIGN = "\u2212"
  const valueText = ctx.value === "" ? "Empty" : ctx.value.replace("-", MINUS_SIGN)

  return {
    inputProps: normalize<Props.Input>({
      id: dom.getInputId(ctx),
      role: "spinbutton",
      pattern: ctx.pattern,
      inputMode: "decimal",
      autoComplete: "off",
      autoCorrect: "off",
      type: "text",
      "aria-valuemin": ctx.min,
      "aria-valuemax": ctx.max,
      "aria-valuetext": valueText,
      "aria-valuenow": isNaN(valueAsNumber) ? undefined : valueAsNumber,
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
        send({ type: "CHANGE", value: event.target.value, hint: "set" })
      },
      onKeyDown(event) {
        const evt = (event.nativeEvent ?? event) as KeyboardEvent
        if (evt.isComposing) return

        if (!utils.isValidNumericEvent(event) || (event.key === "." && ctx.value.includes("."))) {
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
      "aria-disabled": !canDecrement,
      disabled: !canDecrement,
      role: "button",
      tabIndex: -1,
      onPointerDown(event) {
        event.preventDefault()
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
      "aria-disabled": !canIncrement,
      disabled: !canIncrement,
      role: "button",
      tabIndex: -1,
      id: dom.getIncButtonId(ctx),
      onPointerDown(event) {
        event.preventDefault()
        send({ type: "PRESS_DOWN", hint: "increment" })
      },
      onPointerUp(event) {
        event.preventDefault()
        send({ type: "PRESS_UP", hint: "increment" })
      },
      onPointerLeave() {
        send({ type: "PRESS_UP", hint: "increment" })
      },
    }),

    scrubberProps: normalize<Props.Element>({
      id: dom.getScrubberId(ctx),
      role: "presentation",
      onPointerDown(event) {
        const evt = (event.nativeEvent ?? event) as PointerEvent
        evt.preventDefault()
        send({ type: "PRESS_DOWN_SCRUB", point: fromPointerEvent(evt) })
      },
    }),
  }
}
