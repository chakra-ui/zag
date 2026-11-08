import type { Service } from "@zag-js/core"
import {
  contains,
  dataAttr,
  getEventKey,
  getEventTarget,
  isAnchorElement,
  isComposingEvent,
  isModifierKey,
  isOpeningInNewTab,
  isSafari,
} from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes, Rect } from "@zag-js/types"
import { toPx } from "@zag-js/utils"
import { parts } from "./tabs.anatomy"
import * as dom from "./tabs.dom"
import type { ContentProps, ContentState, TabsApi, TabsSchema, TriggerProps, TriggerState } from "./tabs.types"

export function connect<T extends PropTypes>(service: Service<TabsSchema>, normalize: NormalizeProps<T>): TabsApi<T> {
  const { state, send, context, prop, scope, computed } = service

  const translations = prop("translations")
  const focused = state.matches("focused")

  const isVertical = prop("orientation") === "vertical"
  const isHorizontal = prop("orientation") === "horizontal"
  const virtualFocus = prop("virtualFocus")
  const tabStopValue = context.get("tabStopValue") ?? context.get("value")
  const activationDirection = computed("activationDirection")

  // Server render, or the indicator hasn't been measured yet (e.g. inside a hidden panel)
  const indicatorRect = context.get("indicatorRect")
  const indicatorPending = context.get("ssr") || (indicatorRect != null && isRectEmpty(indicatorRect))

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function sendKeyboardEvent(type: string, key?: string) {
    send({ type, key, src: "keyboard" })
  }

  function getTriggerState(props: TriggerProps): TriggerState {
    return {
      selected: context.get("value") === props.value,
      focused: context.get("focusedValue") === props.value,
      disabled: !!props.disabled,
    }
  }

  function getContentState(props: ContentProps): ContentState {
    return { selected: context.get("value") === props.value }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    value: context.get("value"),
    focusedValue: context.get("focusedValue"),
    activationDirection,
    setValue(value) {
      send({ type: "SET_VALUE", value })
    },
    clearValue() {
      send({ type: "CLEAR_VALUE" })
    },
    setIndicatorRect(value) {
      send({ type: "SET_INDICATOR_RECT", value })
    },
    syncTabIndex() {
      send({ type: "SYNC_TAB_INDEX" })
    },
    selectNext(fromValue) {
      send({ type: "SELECT_NEXT", value: fromValue })
    },
    selectPrevious(fromValue) {
      send({ type: "SELECT_PREV", value: fromValue })
    },
    focus() {
      const value = context.get("value")
      if (!value) return
      dom.getTriggerEl(scope, value)?.focus()
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs(scope.id),
        "data-orientation": prop("orientation"),
        "data-focus": dataAttr(focused),
        "data-activation-direction": activationDirection,
        dir: prop("dir"),
      })
    },

    getListProps() {
      return normalize.element({
        ...parts.list.attrs(scope.id),
        role: "tablist",
        dir: prop("dir"),
        "data-focus": dataAttr(focused),
        "aria-orientation": prop("orientation"),
        "data-orientation": prop("orientation"),
        "data-activation-direction": activationDirection,
        "aria-label": translations?.listLabel,
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (isComposingEvent(event)) return
          if (isModifierKey(event) || event.shiftKey) return
          if (!contains(event.currentTarget, getEventTarget(event))) return

          const keyMap: EventKeyMap = {
            ArrowDown() {
              if (isHorizontal) return
              sendKeyboardEvent("ARROW_NEXT", "ArrowDown")
            },
            ArrowUp() {
              if (isHorizontal) return
              sendKeyboardEvent("ARROW_PREV", "ArrowUp")
            },
            ArrowLeft() {
              if (isVertical) return
              sendKeyboardEvent("ARROW_PREV", "ArrowLeft")
            },
            ArrowRight() {
              if (isVertical) return
              sendKeyboardEvent("ARROW_NEXT", "ArrowRight")
            },
            Home() {
              sendKeyboardEvent("HOME")
            },
            End() {
              sendKeyboardEvent("END")
            },
          }

          let key = getEventKey(event, {
            dir: prop("dir"),
            orientation: prop("orientation"),
          })

          const exec = keyMap[key]

          if (exec) {
            event.preventDefault()
            exec(event)
            return
          }
        },
      })
    },

    getTriggerState,

    getTriggerProps(props) {
      const { value, disabled } = props
      const triggerState = getTriggerState(props)

      return normalize.button({
        ...parts.trigger.attrs(scope.id),
        role: "tab",
        type: "button",
        disabled,
        dir: prop("dir"),
        "data-orientation": prop("orientation"),
        "data-disabled": dataAttr(disabled),
        "aria-disabled": disabled,
        "data-value": value,
        "aria-selected": triggerState.selected,
        "data-selected": dataAttr(triggerState.selected),
        "data-focus": dataAttr(triggerState.focused),
        "aria-controls": triggerState.selected ? dom.getContentId(scope, value) : undefined,
        "data-indicator-pending": dataAttr(indicatorPending),
        "data-activation-direction": activationDirection,
        id: dom.getTriggerId(scope, value),
        tabIndex: !virtualFocus && tabStopValue === value ? 0 : -1,
        onFocus() {
          send({ type: "TAB_FOCUS", value })
        },
        onBlur(event) {
          if (contains(dom.getListEl(scope), event.relatedTarget)) return
          send({ type: "TAB_BLUR" })
        },
        onClick(event) {
          if (event.defaultPrevented) return
          if (isOpeningInNewTab(event)) return
          if (disabled) return
          if (isSafari()) {
            event.currentTarget.focus()
          }
          const node = event.currentTarget
          const shouldNavigate = prop("navigate") != null && isAnchorElement(node)

          if (shouldNavigate) event.preventDefault()
          send({ type: "TAB_CLICK", value })
        },
      })
    },

    getContentState,
    getContentProps(props) {
      const { value } = props
      const contentState = getContentState(props)
      return normalize.element({
        ...parts.content.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getContentId(scope, value),
        tabIndex: virtualFocus ? -1 : contentState.selected && context.get("hasFocusableContent") ? undefined : 0,
        "aria-labelledby": dom.getTriggerId(scope, value),
        role: "tabpanel",
        "data-selected": dataAttr(contentState.selected),
        "data-orientation": prop("orientation"),
        "data-activation-direction": activationDirection,
        hidden: !contentState.selected,
      })
    },

    getIndicatorProps() {
      const rect = context.get("indicatorRect")

      return normalize.element({
        ...parts.indicator.attrs(scope.id),
        dir: prop("dir"),
        "data-orientation": prop("orientation"),
        "data-instant": dataAttr(context.get("indicatorInstant")),
        "data-activation-direction": activationDirection,
        hidden: isRectEmpty(rect),
        style: {
          "--left": toPx(rect?.x),
          "--top": toPx(rect?.y),
          "--width": toPx(rect?.width),
          "--height": toPx(rect?.height),
          position: "absolute",
          [isHorizontal ? "left" : "top"]: isHorizontal ? "var(--left)" : "var(--top)",
        },
      })
    },
  }
}

const isRectEmpty = (rect: Rect | null) =>
  rect == null || (rect.width === 0 && rect.height === 0 && rect.x === 0 && rect.y === 0)
