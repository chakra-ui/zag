import { StateMachine as S } from "@ui-machines/core"
import { range as createRange } from "tiny-num"
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
      pattern: "[0-9]*(.[0-9]+)?",
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
        send("INPUT_FOCUS")
      },
      onBlur() {
        send("INPUT_BLUR")
      },
      onChange(event) {
        send({
          type: "INPUT_CHANGE",
          value: event.target.value,
        })
      },
      onKeyDown(event) {
        if (!utils.isValidNumericEvent(event) || (event.key === "." && ctx.value.includes("."))) {
          event.preventDefault()
        }

        const step = getEventStep(event) * ctx.step
        const keyMap: DOM.EventKeyMap = {
          ArrowUp() {
            send({ type: "INC", step })
          },
          ArrowDown() {
            send({ type: "DEC", step })
          },
          Home() {
            send("GO_TO_MIN")
          },
          End() {
            send("GO_TO_MAX")
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
        send("PRESS_DOWN_DEC")
      },
      onPointerUp() {
        send("PRESS_UP_DEC")
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
        send("PRESS_DOWN_INC")
      },
      onPointerUp(event) {
        event.preventDefault()
        send("PRESS_UP_INC")
      },
    }),
  }
}
