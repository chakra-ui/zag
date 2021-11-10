import { StateMachine as S } from "@ui-machines/core"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/prop-types"
import type { EventKeyMap } from "../utils"
import { dom } from "./pin-input.dom"
import { PinInputMachineContext, PinInputMachineState } from "./pin-input.machine"

export function pinInputConnect<T extends PropTypes = ReactPropTypes>(
  state: S.State<PinInputMachineContext, PinInputMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state

  return {
    getInputProps({ index }: { index: number }) {
      return normalize.input<T>({
        id: dom.getInputId(ctx, index),
        "data-ownedby": dom.getRootId(ctx),
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
