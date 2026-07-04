import {
  ariaAttr,
  contains,
  dataAttr,
  getEventKey,
  getEventTarget,
  isCaretAtEnd,
  isCaretAtStart,
} from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./toolbar.anatomy"
import * as dom from "./toolbar.dom"
import type { ItemProps, ItemState, ToolbarApi, ToolbarService } from "./toolbar.types"

export function connect<T extends PropTypes>(service: ToolbarService, normalize: NormalizeProps<T>): ToolbarApi<T> {
  const { context, send, prop, scope } = service

  const orientation = prop("orientation")
  const isHorizontal = orientation === "horizontal"
  const rootDisabled = !!prop("disabled")

  function getItemState(props: ItemProps): ItemState {
    return {
      id: dom.getItemId(scope, props.value),
      disabled: Boolean(props.disabled || rootDisabled),
      focusableWhenDisabled: props.focusableWhenDisabled ?? true,
      focused: context.get("focusedValue") === props.value,
    }
  }

  function getNavKeyMap(): EventKeyMap {
    const map: EventKeyMap = {
      Home() {
        send({ type: "ITEM.FOCUS_FIRST" })
      },
      End() {
        send({ type: "ITEM.FOCUS_LAST" })
      },
    }
    if (isHorizontal) {
      map.ArrowRight = () => send({ type: "ITEM.FOCUS_NEXT" })
      map.ArrowLeft = () => send({ type: "ITEM.FOCUS_PREV" })
    } else {
      map.ArrowDown = () => send({ type: "ITEM.FOCUS_NEXT" })
      map.ArrowUp = () => send({ type: "ITEM.FOCUS_PREV" })
    }
    return map
  }

  return {
    disabled: rootDisabled,
    focusedValue: context.get("focusedValue"),
    orientation,

    getItemId(value) {
      return dom.getItemId(scope, value)
    },

    getItemState,

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs(scope.id),
        id: dom.getRootId(scope),
        role: "toolbar",
        dir: prop("dir"),
        "aria-orientation": orientation,
        "data-orientation": orientation,
        "aria-disabled": ariaAttr(rootDisabled),
        "data-disabled": dataAttr(rootDisabled),
        tabIndex: context.get("hasInteracted") ? -1 : 0,
        style: { outline: "none" },
        onMouseDown() {
          if (rootDisabled) return
          send({ type: "ROOT.MOUSE_DOWN" })
        },
        onFocus(event) {
          if (rootDisabled) return
          const target = getEventTarget<HTMLElement>(event)
          if (event.currentTarget !== target) {
            if (contains(event.currentTarget, target)) send({ type: "DESCENDANT.FOCUS" })
            return
          }
          if (context.get("isClickFocus")) return
          send({ type: "ROOT.FOCUS" })
        },
        onBlur(event) {
          const relatedTarget = event.relatedTarget as HTMLElement | null
          if (contains(event.currentTarget, relatedTarget)) return
          if (rootDisabled) return
          send({ type: "ROOT.BLUR" })
        },
        onKeyDown(event) {
          if (rootDisabled) return
          if (event.defaultPrevented) return
          const target = getEventTarget<HTMLElement>(event)
          if (!contains(event.currentTarget, target)) return

          const keyMap = getNavKeyMap()
          const exec = keyMap[getEventKey(event, { dir: prop("dir"), orientation })]
          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
      })
    },

    getGroupProps(props) {
      return normalize.element({
        ...parts.group.attrs(scope.id),
        id: dom.getGroupId(scope, props.value),
        role: "group",
        dir: prop("dir"),
        "aria-disabled": ariaAttr(!!props.disabled),
        "data-disabled": dataAttr(!!props.disabled),
        "data-orientation": orientation,
      })
    },

    getSeparatorProps() {
      const separatorOrientation = isHorizontal ? "vertical" : "horizontal"
      return normalize.element({
        ...parts.separator.attrs(scope.id),
        role: "separator",
        dir: prop("dir"),
        "aria-orientation": separatorOrientation,
        "data-orientation": separatorOrientation,
      })
    },

    getItemProps(props) {
      const itemState = getItemState(props)
      const isNativelyDisabled = itemState.disabled && !itemState.focusableWhenDisabled
      return normalize.button({
        ...parts.item.attrs(scope.id),
        id: itemState.id,
        type: "button",
        dir: prop("dir"),
        disabled: isNativelyDisabled || undefined,
        "aria-disabled": ariaAttr(itemState.disabled),
        "data-disabled": dataAttr(itemState.disabled),
        "data-focusable-when-disabled": dataAttr(itemState.disabled && itemState.focusableWhenDisabled),
        "data-orientation": orientation,
        tabIndex: isNativelyDisabled ? undefined : itemState.focused ? 0 : -1,
        onFocus() {
          send({ type: "ITEM.FOCUS", value: props.value })
        },
      })
    },

    getLinkProps(props) {
      const id = dom.getItemId(scope, props.value)
      const focused = context.get("focusedValue") === props.value
      return normalize.element({
        ...parts.item.attrs(scope.id),
        id,
        dir: prop("dir"),
        "data-orientation": orientation,
        tabIndex: focused ? 0 : -1,
        onFocus() {
          send({ type: "ITEM.FOCUS", value: props.value })
        },
      })
    },

    getInputProps(props) {
      const itemState = getItemState(props)
      const isNativelyDisabled = itemState.disabled && !itemState.focusableWhenDisabled
      return normalize.input({
        ...parts.item.attrs(scope.id),
        id: itemState.id,
        dir: prop("dir"),
        disabled: isNativelyDisabled || undefined,
        readOnly: itemState.disabled && itemState.focusableWhenDisabled ? true : undefined,
        "aria-disabled": ariaAttr(itemState.disabled),
        "data-disabled": dataAttr(itemState.disabled),
        "data-focusable-when-disabled": dataAttr(itemState.disabled && itemState.focusableWhenDisabled),
        "data-orientation": orientation,
        tabIndex: isNativelyDisabled ? undefined : itemState.focused ? 0 : -1,
        onClick(event) {
          if (itemState.disabled) event.preventDefault()
        },
        onPointerDown(event) {
          if (itemState.disabled) event.preventDefault()
        },
        onFocus(event) {
          send({ type: "ITEM.FOCUS", value: props.value })
          event.currentTarget.select()
        },
        onKeyDown(event) {
          const key = getEventKey(event, { dir: prop("dir"), orientation })

          if (key === "Home" || key === "End") {
            event.stopPropagation()
            return
          }

          const isForward = isHorizontal ? key === "ArrowRight" : key === "ArrowDown"
          const isBackward = isHorizontal ? key === "ArrowLeft" : key === "ArrowUp"
          if (!isForward && !isBackward) return

          if (event.defaultPrevented) {
            event.stopPropagation()
            return
          }

          const input = event.currentTarget
          const collapsed = input.selectionStart === input.selectionEnd
          const atBoundary = isForward ? isCaretAtEnd(input) : isCaretAtStart(input)

          if (!collapsed || !atBoundary) {
            event.stopPropagation()
          }
        },
      })
    },
  }
}
