import { getNativeEvent, isVirtualClick, isVirtualPointerEvent } from "@zag-js/dom-event"
import { contains } from "@zag-js/dom-query"
import { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./pressable.dom"
import { Send, State } from "./pressable.types"
import { isValidKeyboardEvent, shouldPreventDefault, shouldPreventDefaultKeyboard } from "./pressable.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isPressed = state.hasTag("pressed")
  const isDisabled = state.context.disabled
  return {
    isPressed,
    pressableProps: normalize.element({
      id: dom.getPressableId(state.context),
      "data-disabled": isDisabled || undefined,
      "data-pressed": isPressed || undefined,
      onKeyDown(event) {
        const evt = getNativeEvent(event)

        if (!isValidKeyboardEvent(evt)) return
        if (!contains(event.currentTarget, event.target)) return

        if (!event.repeat) {
          send({ type: "KEY_DOWN", event, pointerType: "keyboard" })
        }

        if (shouldPreventDefaultKeyboard(event.target)) {
          event.preventDefault()
        }
      },
      onKeyUp(event) {
        const evt = getNativeEvent(event)

        if (!isValidKeyboardEvent(evt) || event.repeat) return
        if (!contains(event.currentTarget, event.target)) return

        send({ type: "KEY_UP", event, pointerType: "keyboard" })
      },
      onClick(event) {
        const evt = getNativeEvent(event)
        if (!contains(event.currentTarget, event.target) || event.button !== 0) return

        const ctx = state.context

        if (ctx.disabled) {
          event.preventDefault()
        }

        const isVirtual = ctx.pointerType === "virtual" || isVirtualClick(evt)
        if (!ctx.ignoreClickAfterPress && isVirtual) {
          send({ type: "CLICK", event, pointerType: "virtual" })
        }
      },
      onPointerDown(event) {
        if (state.context.disabled) {
          return
        }

        if (event.button !== 0 || !contains(event.currentTarget, event.target)) {
          return
        }

        if (shouldPreventDefault(event.currentTarget)) {
          event.preventDefault()
        }

        const evt = getNativeEvent(event)
        const pointerType = isVirtualPointerEvent(evt) ? "virtual" : event.pointerType
        send({ type: "POINTER_DOWN", event, pointerType })
      },
      onMouseDown(event) {
        if (event.button !== 0) return
        if (shouldPreventDefault(event.currentTarget)) {
          event.preventDefault()
        }
      },
      onDragStart(event) {
        send({ type: "DRAG_START", event })
      },
    }),
  }
}
