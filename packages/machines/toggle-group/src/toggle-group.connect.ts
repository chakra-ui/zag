import { contains, dataAttr, getEventKey, getEventTarget, isSafari } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
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
  const isWithinToolbar = context.get("isWithinToolbar")

  function getItemState(props: ItemProps): ItemState {
    return {
      id: dom.getItemId(scope, props.value),
      disabled: Boolean(props.disabled || disabled),
      pressed: !!value.includes(props.value),
      focused: context.get("focusedValue") === props.value,
    }
  }

  return {
    value,
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs(scope.id),
        dir: prop("dir"),
        role: isSingle ? "radiogroup" : "group",
        // Omit when nested in a toolbar so it doesn't add its own extra tab stop.
        tabIndex: isWithinToolbar ? undefined : context.get("hasInteracted") ? -1 : 0,
        "data-disabled": dataAttr(disabled),
        "data-orientation": prop("orientation"),
        style: { outline: "none" },
        onMouseDown() {
          if (disabled) return
          send({ type: "ROOT.MOUSE_DOWN" })
        },
        onFocus(event) {
          if (disabled) return
          if (event.currentTarget !== getEventTarget(event)) return
          if (context.get("isClickFocus")) return
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
        ...parts.item.attrs(scope.id),
        id: itemState.id,
        type: "button",
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
          send({ type: "TOGGLE.FOCUS", value: props.value })
        },
        onClick(event) {
          if (itemState.disabled) return
          send({ type: "TOGGLE.CLICK", value: props.value })
          if (isSafari()) {
            event.currentTarget.focus({ preventScroll: true })
          }
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!contains(event.currentTarget, getEventTarget(event))) return
          if (itemState.disabled) return

          const key = getEventKey(event, { dir: prop("dir"), orientation: prop("orientation") })

          if (!rovingFocus) return

          const currentLoopFocus = prop("loopFocus") && !isWithinToolbar
          const hasNext = () => dom.getNextEl(scope, itemState.id, currentLoopFocus)?.id !== itemState.id
          const hasPrev = () => dom.getPrevEl(scope, itemState.id, currentLoopFocus)?.id !== itemState.id

          let handled = false

          if (isHorizontal && key === "ArrowLeft" && hasPrev()) {
            send({ type: "TOGGLE.FOCUS_PREV" })
            handled = true
          } else if (isHorizontal && key === "ArrowRight" && hasNext()) {
            send({ type: "TOGGLE.FOCUS_NEXT" })
            handled = true
          } else if (!isHorizontal && key === "ArrowUp" && hasPrev()) {
            send({ type: "TOGGLE.FOCUS_PREV" })
            handled = true
          } else if (!isHorizontal && key === "ArrowDown" && hasNext()) {
            send({ type: "TOGGLE.FOCUS_NEXT" })
            handled = true
          } else if (key === "Home" && !isWithinToolbar) {
            send({ type: "TOGGLE.FOCUS_FIRST" })
            handled = true
          } else if (key === "End" && !isWithinToolbar) {
            send({ type: "TOGGLE.FOCUS_LAST" })
            handled = true
          }

          if (handled) {
            event.preventDefault()
            event.stopPropagation()
          }
        },
      })
    },
  }
}
