import { StateMachine as S } from "@ui-machines/core"
import { defaultPropNormalizer } from "../utils/dom-attr"
import { InputProps, EventKeyMap } from "../utils/types"
import { getElementIds } from "./pin-input.dom"
import { PinInputMachineContext, PinInputMachineState } from "./pin-input.machine"

export function connectPinInputMachine(
  state: S.State<PinInputMachineContext, PinInputMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const ids = getElementIds(ctx.uid)

  return {
    getInputProps({ index }: { index: number }) {
      return normalize<InputProps>({
        id: ids.getInputId(index),
        "data-ownedby": ids.root,
        "aria-label": "Please enter your pin code",
        inputMode: ctx.type === "number" ? "numeric" : "text",
        "aria-invalid": ctx.invalid,
        onChange(event) {
          send({ type: "TYPE", value: event.target.value })
        },
        onKeyDown(event) {
          const keyMap: EventKeyMap = {
            Backspace() {
              send("BACKSPACE")
            },
          }

          const exec = keyMap[event.key]

          if (exec) {
            event.preventDefault()
            exec?.(event)
          }
        },
        onFocus() {
          send({ type: "FOCUS", index })
        },
        onBlur() {
          send({ type: "BLUR", index })
        },
        value: ctx.value[index] || "",
        autoComplete: ctx.otp ? "one-time-code" : "off",
        placeholder: ctx.focusedIndex === index ? "" : ctx.placeholder,
      })
    },
  }
}
