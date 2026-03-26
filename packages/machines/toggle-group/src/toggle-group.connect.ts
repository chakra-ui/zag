import { contains, dataAttr, getEventKey, getEventTarget, isSafari } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./toggle-group.anatomy"
import * as dom from "./toggle-group.dom"
import type { ItemProps, ItemState, ToggleGroupApi, ToggleGroupService } from "./toggle-group.types"

export function connect<T extends PropTypes>(
  service: ToggleGroupService,
  normalize: NormalizeProps<T>,
): ToggleGroupApi<T> {
  const { context, send, prop, scope } = service

  const value = context.get("value")
  const disabled = prop("disabled")
  const isSingle = !prop("multiple")
  const rovingFocus = prop("rovingFocus")
  const isHorizontal = prop("orientation") === "horizontal"

  function getItemState(props: ItemProps): ItemState {
    const id = dom.getItemId(scope, props.value)
    return {
      id,
      disabled: Boolean(props.disabled || disabled),
      pressed: !!value.includes(props.value),
      focused: context.get("focusedId") === id,
    }
  }

  return {
    value,
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        dir: prop("dir"),
        role: isSingle ? "radiogroup" : "group",
        tabIndex: context.get("isTabbingBackward") ? -1 : 0,
        "data-disabled": dataAttr(disabled),
        "data-orientation": prop("orientation"),
        "data-focus": dataAttr(context.get("focusedId") != null),
        style: { outline: "none" },
        onMouseDown() {
          if (disabled) return
          send({ type: "ROOT.MOUSE_DOWN" })
        },
        onFocus(event) {
          if (disabled) return
          if (event.currentTarget !== getEventTarget(event)) return
          if (context.get("isClickFocus")) return
          if (context.get("isTabbingBackward")) return
          send({ type: "ROOT.FOCUS" })
        },
        onBlur(event) {
          const target = event.relatedTarget as HTMLElement | null
          if (contains(event.currentTarget, target)) return
          if (disabled) return
          send({ type: "ROOT.BLUR" })
        },
      })
    },

    getItemState,

    getItemProps(props) {
      const itemState = getItemState(props)
      const rovingTabIndex = itemState.focused ? 0 : -1

      return normalize.button({
        ...parts.item.attrs,
        id: itemState.id,
        type: "button",
        "data-ownedby": dom.getRootId(scope),
        "data-focus": dataAttr(itemState.focused),
        disabled: itemState.disabled,
        tabIndex: rovingFocus ? rovingTabIndex : undefined,
        // radio
        role: isSingle ? "radio" : undefined,
        "aria-checked": isSingle ? itemState.pressed : undefined,
        "aria-pressed": isSingle ? undefined : itemState.pressed,
        //
        "data-disabled": dataAttr(itemState.disabled),
        "data-orientation": prop("orientation"),
        dir: prop("dir"),
        "data-state": itemState.pressed ? "on" : "off",
        onFocus() {
          if (itemState.disabled) return
          send({ type: "TOGGLE.FOCUS", id: itemState.id })
        },
        onClick(event) {
          if (itemState.disabled) return
          send({ type: "TOGGLE.CLICK", id: itemState.id, value: props.value })
          if (isSafari()) {
            event.currentTarget.focus({ preventScroll: true })
          }
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!contains(event.currentTarget, getEventTarget(event))) return
          if (itemState.disabled) return

          const keyMap: EventKeyMap = {
            Tab(event) {
              const isShiftTab = event.shiftKey
              send({ type: "TOGGLE.SHIFT_TAB", isShiftTab })
            },
            ArrowLeft() {
              if (!rovingFocus || !isHorizontal) return
              send({ type: "TOGGLE.FOCUS_PREV" })
            },
            ArrowRight() {
              if (!rovingFocus || !isHorizontal) return
              send({ type: "TOGGLE.FOCUS_NEXT" })
            },
            ArrowUp() {
              if (!rovingFocus || isHorizontal) return
              send({ type: "TOGGLE.FOCUS_PREV" })
            },
            ArrowDown() {
              if (!rovingFocus || isHorizontal) return
              send({ type: "TOGGLE.FOCUS_NEXT" })
            },
            Home() {
              if (!rovingFocus) return
              send({ type: "TOGGLE.FOCUS_FIRST" })
            },
            End() {
              if (!rovingFocus) return
              send({ type: "TOGGLE.FOCUS_LAST" })
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
