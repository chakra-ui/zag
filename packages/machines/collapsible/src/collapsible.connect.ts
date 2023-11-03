import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./collapsible.anatomy"
import { dom } from "./collapsible.dom"
import type { MachineApi, Send, State } from "./collapsible.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isOpen = state.matches("open")
  const isDisabled = state.context.isDisabled
  const isFocused = !isDisabled && state.context.focused

  const dataAttrs = {
    "data-active": dataAttr(state.context.active),
    "data-focus": dataAttr(isFocused),
    "data-hover": dataAttr(state.context.hovered),
    "data-disabled": dataAttr(isDisabled),
    "data-state": isOpen ? "open" : "closed",
  }

  return {
    isOpen,
    isDisabled,
    isFocused,
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      ...dataAttrs,
      dir: state.context.dir,
      id: dom.getRootId(state.context),
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      ...dataAttrs,
      dir: state.context.dir,
      id: dom.getContentId(state.context),
      role: "region",
      hidden: !isOpen,
      "aria-expanded": isOpen,
    }),

    triggerProps: normalize.element({
      ...parts.trigger.attrs,
      ...dataAttrs,
      id: dom.getTriggerId(state.context),
      dir: state.context.dir,
      type: "button",
      disabled: isDisabled,
      "aria-controls": dom.getContentId(state.context),
      "aria-expanded": isOpen,
      "aria-describedby": isOpen ? dom.getContentId(state.context) : undefined,
      onPointerMove() {
        if (isDisabled) return
        send({ type: "CONTEXT.SET", context: { hovered: true } })
      },
      onPointerLeave() {
        if (isDisabled) return
        send({ type: "CONTEXT.SET", context: { hovered: false } })
      },
      onFocus() {
        if (isDisabled) return
        send({ type: "CONTEXT.SET", context: { focused: true } })
      },
      onBlur() {
        if (isDisabled) return
        send({ type: "CONTEXT.SET", context: { focused: false } })
      },
      onPointerDown(event) {
        if (isDisabled) return
        // On pointerdown, the input blurs and returns focus to the `body`,
        // we need to prevent this.
        if (isFocused && event.pointerType === "mouse") {
          event.preventDefault()
        }
        send({ type: "CONTEXT.SET", context: { active: true } })
      },
      onPointerUp() {
        if (isDisabled) return
        send({ type: "CONTEXT.SET", context: { active: false } })
      },
      onClick() {
        if (isDisabled) return
        send("TOGGLE")
      },
    }),
  }
}
