import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { dataAttr, isSafari, isSelfEvent } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./toggle-group.anatomy"
import { dom } from "./toggle-group.dom"
import type { MachineApi, Send, State } from "./toggle-group.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const value = state.context.value
  const disabled = state.context.disabled
  const isSingle = !state.context.multiple
  const rovingFocus = state.context.rovingFocus

  return {
    value,
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
      dir: state.context.dir,
      role: isSingle ? "radiogroup" : "group",
      tabIndex: state.context.isTabbingBackward ? -1 : 0,
      "data-disabled": dataAttr(disabled),
      "data-orientation": state.context.orientation,
      "data-focus": dataAttr(state.context.focusedId != null),
      style: { outline: "none" },
      onMouseDown() {
        send("ROOT.MOUSE_DOWN")
      },
      onFocus(event) {
        if (!isSelfEvent(event) || !!state.context.isClickFocus || state.context.isTabbingBackward) return
        send("ROOT.FOCUS")
      },
      onBlur() {
        send("ROOT.BLUR")
      },
    }),

    getToggleProps(props) {
      const isDisabled = props.disabled || disabled
      const isPressed = value?.includes(props.value)

      const id = dom.getToggleId(state.context, props.value)
      const isFocused = state.context.focusedId === id
      const rovingTabIndex = isFocused ? 0 : -1

      return normalize.button({
        ...parts.toggle.attrs,
        id,
        type: "button",
        "data-ownedby": dom.getRootId(state.context),
        "data-focus": dataAttr(isFocused),
        disabled: isDisabled,
        tabIndex: rovingFocus ? rovingTabIndex : undefined,
        // radio
        role: isSingle ? "radio" : undefined,
        "aria-checked": isSingle ? isPressed : undefined,
        "aria-pressed": isSingle ? undefined : isPressed,
        //
        "data-disabled": dataAttr(isDisabled),
        "data-orientation": state.context.orientation,
        dir: state.context.dir,
        "data-state": isPressed ? "on" : "off",
        onFocus() {
          if (isDisabled) return
          send({ type: "TOGGLE.FOCUS", id })
        },
        onClick(event) {
          if (isDisabled) return
          send({ type: "TOGGLE.CLICK", id, value: props.value })
          if (isSafari()) {
            event.currentTarget.focus({ preventScroll: true })
          }
        },
        onKeyDown(event) {
          if (isDisabled || !isSelfEvent(event)) return
          const isHorizontal = state.context.orientation === "horizontal"

          const keyMap: EventKeyMap = {
            Tab(event) {
              const isShiftTab = event.shiftKey
              send({ type: "TOGGLE.SHIFT_TAB", isShiftTab })
            },
            ArrowLeft() {
              if (!rovingFocus || !isHorizontal) return
              send("TOGGLE.FOCUS_PREV")
            },
            ArrowRight() {
              if (!rovingFocus || !isHorizontal) return
              send("TOGGLE.FOCUS_NEXT")
            },
            ArrowUp() {
              if (!rovingFocus || isHorizontal) return
              send("TOGGLE.FOCUS_PREV")
            },
            ArrowDown() {
              if (!rovingFocus || isHorizontal) return
              send("TOGGLE.FOCUS_NEXT")
            },
            Home() {
              if (!rovingFocus) return
              send("TOGGLE.FOCUS_FIRST")
            },
            End() {
              if (!rovingFocus) return
              send("TOGGLE.FOCUS_LAST")
            },
          }

          const exec = keyMap[getEventKey(event)]

          if (exec) {
            exec(event)
            if (event.key !== "Tab") event.preventDefault()
          }
        },
      })
    },
  }
}
