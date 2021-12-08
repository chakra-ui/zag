import { StateMachine as S } from "@ui-machines/core"
import { ariaAttr, dataAttr, EventKeyMap, getEventKey, getNativeEvent } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { isModifiedEvent } from "@ui-machines/utils"
import { dom } from "./pin-input.dom"
import { MachineContext, MachineState } from "./pin-input.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: S.State<MachineContext, MachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state

  return {
    value: ctx.value,
    focusedIndex: ctx.focusedIndex,

    setValue(value: number[]) {
      send({ type: "SET_VALUE", value })
    },
    clearValue() {
      send({ type: "CLEAR_VALUE" })
    },
    setValueAtIndex(value: string, index: number) {
      send({ type: "SET_VALUE", value, index })
    },
    focus() {
      dom.getFirstInputEl(ctx)?.focus()
    },
    blur() {
      if (ctx.focusedIndex === -1) return
      dom.getFirstInputEl(ctx)?.blur()
    },

    containerProps: normalize.element<T>({
      "data-part": "container",
      id: dom.getRootId(ctx),
      "data-invalid": dataAttr(ctx.invalid),
      "data-disabled": dataAttr(ctx.disabled),
      "data-complete": dataAttr(ctx.isValueComplete),
    }),

    getInputProps({ index }: { index: number }) {
      const inputType = ctx.type === "numeric" ? "tel" : "text"
      return normalize.input<T>({
        "data-part": "input",
        disabled: ctx.disabled,
        "data-disabled": dataAttr(ctx.disabled),
        "data-complete": dataAttr(ctx.isValueComplete),
        id: dom.getInputId(ctx, index),
        "data-ownedby": dom.getRootId(ctx),
        "aria-label": "Please enter your pin code",
        inputMode: ctx.otp || ctx.type === "numeric" ? "numeric" : "text",
        "aria-invalid": ariaAttr(ctx.invalid),
        "data-invalid": dataAttr(ctx.invalid),
        type: ctx.mask ? "password" : inputType,
        value: ctx.value[index] || "",
        autoCapitalize: "off",
        autoComplete: ctx.otp ? "one-time-code" : "off",
        placeholder: ctx.focusedIndex === index ? "" : ctx.placeholder,
        onChange(event) {
          const evt = getNativeEvent(event)
          if (evt.isComposing) return

          const value = event.target.value

          if (evt.inputType === "insertFromPaste" || value.length > 2) {
            send({ type: "PASTE", value })
            event.preventDefault()
            return
          }

          if (evt.inputType === "insertText") {
            send({ type: "INPUT", value })
          }
        },
        onKeyDown(event) {
          const evt = getNativeEvent(event)
          if (evt.isComposing || isModifiedEvent(evt)) return

          const keyMap: EventKeyMap = {
            Backspace() {
              send("BACKSPACE")
            },
            Delete() {
              send("DELETE")
            },
            ArrowLeft() {
              send("ARROW_LEFT")
            },
            ArrowRight() {
              send("ARROW_RIGHT")
            },
          }

          const key = getEventKey(event, { dir: ctx.dir })
          const exec = keyMap[key]

          if (exec) {
            exec?.(event)
            event.preventDefault()
          }
        },
        onFocus() {
          send({ type: "FOCUS", index })
        },
        onBlur() {
          send({ type: "BLUR", index })
        },
      })
    },
  }
}
