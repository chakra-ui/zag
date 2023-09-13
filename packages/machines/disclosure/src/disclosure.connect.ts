import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./disclosure.anatomy"
import type { State, Send, MachineApi } from "./disclosure.types"
import { dom } from "./disclosure.dom"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isDisabled = state.context.disabled ?? false
  const isOpen = state.context.open ?? false
  const isFocused = (!isDisabled && state.context.focused) ?? false

  const dataAttrs = {
    "data-focus": dataAttr(isFocused),
    "data-disabled": dataAttr(isDisabled),
    "data-state": isOpen ? "open" : "closed",
  }

  return {
    isOpen,
    isDisabled,
    isFocused,
    buttonProps: normalize.element({
      ...parts.button.attrs,
      ...dataAttrs,
      id: dom.getButtonId(state.context),
      role: "button",
      "aria-expanded": isOpen,
      "aria-controls": dom.getDisclosureId(state.context),
      onFocus() {
        if (isDisabled) return
        send({ type: "BUTTON.FOCUS" })
      },
      onBlur() {
        if (isDisabled) return
        send({ type: "BUTTON.BLUR" })
      },
      onClick() {
        if (isDisabled) return
        send({ type: "OPEN.TOGGLE" })
      },
      onKeyDown(event) {
        if (isDisabled) return
        if (!isFocused) return

        const keyMap: EventKeyMap = {
          Enter: () => send({ type: "OPEN.TOGGLE" }),
          Space: () => send({ type: "OPEN.TOGGLE" }),
        }

        const key = getEventKey(event)

        const exec = keyMap[key]

        if (exec) {
          exec(event)
          event.preventDefault()
        }
      },
    }),
    disclosureProps: normalize.element({
      ...parts.disclosure.attrs,
      id: dom.getDisclosureId(state.context),
      hidden: !isOpen,
    }),

    setOpen(open: boolean) {
      send({ type: "OPEN.SET", open })
    },

    toggleOpen() {
      send({ type: "OPEN.TOGGLE" })
    },
  }
}
