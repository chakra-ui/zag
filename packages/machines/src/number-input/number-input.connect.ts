import {
  defaultPropNormalizer,
  PropNormalizer,
  StateMachine as S,
} from "@ui-machines/core"
import { Range } from "@ui-machines/utils/range"
import { getStepMultipler } from "../event-utils"
import { DOMButtonProps, DOMInputProps, EventKeyMap } from "../type-utils"
import { getElementIds } from "./number-input.dom"
import {
  NumberInputMachineContext,
  NumberInputMachineState,
} from "./number-input.machine"
import { isValidNumericKeyboardEvent } from "./number-input.utils"

export function connectNumberInputMachine(
  state: S.State<NumberInputMachineContext, NumberInputMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize: PropNormalizer = defaultPropNormalizer,
) {
  const { context: ctx } = state

  const { inputId, incButtonId, decButtonId } = getElementIds(ctx.uid)
  const range = new Range(ctx)
  const canIncrement = !ctx.disabled && !range.isAtMax
  const canDecrement = !ctx.disabled && !range.isAtMin

  const valueAsNumber = Number(range)

  const MINUS_SIGN = "\u2212"
  const valueText =
    ctx.value === "" ? "Empty" : ctx.value.replace("-", MINUS_SIGN)

  return {
    inputProps: normalize<DOMInputProps>({
      id: inputId,
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
        if (
          !isValidNumericKeyboardEvent(event) ||
          (event.key === "." && ctx.value.includes("."))
        ) {
          event.preventDefault()
        }

        const step = getStepMultipler(event) * ctx.step
        const keyMap: EventKeyMap = {
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

    decrementButtonProps: normalize<DOMButtonProps>({
      id: decButtonId,
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

    incrementButtonProps: normalize<DOMButtonProps>({
      "aria-disabled": !canIncrement,
      disabled: !canIncrement,
      role: "button",
      tabIndex: -1,
      id: incButtonId,
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
