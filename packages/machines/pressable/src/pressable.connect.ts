import { contains, dataAttr, getNativeEvent, isVirtualClick, isVirtualPointerEvent } from "@zag-js/dom-utils"
import { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./pressable.dom"
import { Send, State } from "./pressable.types"
import { utils } from "./pressable.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isPressed = state.hasTag("pressed")
  const isDisabled = state.context.disabled
  return {
    isPressed,
    pressableProps: normalize.element({
      id: dom.getPressableId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-pressed": dataAttr(isPressed),
      onKeyDown(event) {
        const evt = getNativeEvent(event)

        if (!utils.isValidKeyboardEvent(evt)) return
        if (!contains(event.currentTarget, event.target)) return

        if (!event.repeat) {
          send({ type: "KEY_DOWN", event, pointerType: "keyboard" })
        }

        if (utils.shouldPreventDefaultKeyboard(event.target as Element)) {
          event.preventDefault()
        }
      },
      onKeyUp(event) {
        const evt = getNativeEvent(event)

        if (!utils.isValidKeyboardEvent(evt) || event.repeat) return
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

        if (!ctx.ignoreClickAfterPress && (ctx.pointerType === "virtual" || isVirtualClick(evt))) {
          send({ type: "CLICK", event, pointerType: "virtual" })
        }
      },
      onPointerDown(event) {
        if (event.button !== 0 || !contains(event.currentTarget, event.target)) {
          return
        }

        if (utils.shouldPreventDefault(event.currentTarget)) {
          event.preventDefault()
        }

        const evt = getNativeEvent(event)
        const pointerType = isVirtualPointerEvent(evt) ? "virtual" : event.pointerType
        send({ type: "POINTER_DOWN", event, pointerType })
      },
      onPointerUp(event) {
        if (event.button !== 0) return

        if (!contains(event.currentTarget, event.target)) return
        if (state.context.pointerType === "virtual") return

        send({ type: "POINTER_UP", event })
      },
      onMouseDown(event) {
        if (event.button !== 0) return
        if (utils.shouldPreventDefault(event.currentTarget)) {
          event.preventDefault()
        }
      },
      onDragStart(event) {
        send({ type: "DRAG_START", event })
      },
    }),
  }
}
