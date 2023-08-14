import { getNativeEvent, isVirtualClick, isVirtualPointerEvent } from "@zag-js/dom-event"
import { contains, dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { MachineApi, Send, State } from "./pressable.types"
import { isValidKeyboardEvent, shouldPreventDefault, shouldPreventDefaultKeyboard } from "./pressable.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isPressed = state.hasTag("pressed")
  const isDisabled = state.context.disabled
  return {
    isPressed,
    pressableProps: normalize.element({
      "data-disabled": dataAttr(isDisabled),
      "data-pressed": dataAttr(isPressed),
      onKeyDown(event) {
        const evt = getNativeEvent(event)

        if (!isValidKeyboardEvent(evt)) return
        if (!contains(event.currentTarget, event.target)) return

        if (!event.repeat) {
          const currentTarget = event.currentTarget
          send({ type: "KEY_DOWN", currentTarget, pointerType: "keyboard" })
        }

        if (shouldPreventDefaultKeyboard(event.target)) {
          event.preventDefault()
        }
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
          const currentTarget = event.currentTarget
          send({ type: "CLICK", currentTarget, pointerType: "virtual" })
        }
      },
      onPointerDown(event) {
        if (isDisabled) return

        if (event.button !== 0 || !contains(event.currentTarget, event.target)) {
          return
        }

        if (shouldPreventDefault(event.currentTarget)) {
          event.preventDefault()
        }

        const evt = getNativeEvent(event)

        const pointerType = isVirtualPointerEvent(evt) ? "virtual" : event.pointerType
        const pointerId = evt.pointerId
        const currentTarget = event.currentTarget

        send({ type: "POINTER_DOWN", currentTarget, pointerType, pointerId })
      },
      onMouseDown(event) {
        if (event.button !== 0) return
        if (shouldPreventDefault(event.currentTarget)) {
          event.preventDefault()
        }
      },
      onDragStart(event) {
        const currentTarget = event.currentTarget
        send({ type: "DRAG_START", currentTarget })
      },
    }),
  }
}
