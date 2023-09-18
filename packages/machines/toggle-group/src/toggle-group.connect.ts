import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { dataAttr, isSafari, isSelfEvent } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./toggle-group.anatomy"
import { dom } from "./toggle-group.dom"
import type { ItemProps, ItemState, MachineApi, Send, State } from "./toggle-group.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const value = state.context.value
  const disabled = state.context.disabled
  const isSingle = !state.context.multiple
  const rovingFocus = state.context.rovingFocus
  const isHorizontal = state.context.orientation === "horizontal"

  function getItemState(props: ItemProps): ItemState {
    const isDisabled = !!props.disabled || !!disabled
    const isPressed = value?.includes(props.value)
    const id = dom.getItemId(state.context, props.value)
    const isFocused = state.context.focusedId === id

    return {
      id,
      isDisabled,
      isPressed,
      isFocused,
    }
  }

  return {
    value,
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    getItemState,

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
        if (disabled) return
        send("ROOT.MOUSE_DOWN")
      },
      onFocus(event) {
        if (disabled) return
        if (!isSelfEvent(event) || !!state.context.isClickFocus || state.context.isTabbingBackward) return
        send("ROOT.FOCUS")
      },
      onBlur() {
        if (disabled) return
        send("ROOT.BLUR")
      },
    }),

    getItemProps(props) {
      const itemState = getItemState(props)
      const rovingTabIndex = itemState.isFocused ? 0 : -1

      return normalize.button({
        ...parts.item.attrs,
        id: itemState.id,
        type: "button",
        "data-ownedby": dom.getRootId(state.context),
        "data-focus": dataAttr(itemState.isFocused),
        disabled: itemState.isDisabled,
        tabIndex: rovingFocus ? rovingTabIndex : undefined,
        // radio
        role: isSingle ? "radio" : undefined,
        "aria-checked": isSingle ? itemState.isPressed : undefined,
        "aria-pressed": isSingle ? undefined : itemState.isPressed,
        //
        "data-disabled": dataAttr(itemState.isDisabled),
        "data-orientation": state.context.orientation,
        dir: state.context.dir,
        "data-state": itemState.isPressed ? "on" : "off",
        onFocus() {
          if (itemState.isDisabled) return
          send({ type: "TOGGLE.FOCUS", id: itemState.id })
        },
        onClick(event) {
          if (itemState.isDisabled) return
          send({ type: "TOGGLE.CLICK", id: itemState.id, value: props.value })
          if (isSafari()) {
            event.currentTarget.focus({ preventScroll: true })
          }
        },
        onKeyDown(event) {
          if (itemState.isDisabled || !isSelfEvent(event)) return

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
