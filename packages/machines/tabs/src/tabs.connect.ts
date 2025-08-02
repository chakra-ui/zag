import type { Service } from "@zag-js/core"
import { dataAttr, getEventKey, isComposingEvent, isOpeningInNewTab, isSafari, isSelfTarget } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tabs.anatomy"
import * as dom from "./tabs.dom"
import type { TabsApi, TabsSchema, TriggerProps, TriggerState } from "./tabs.types"

export function connect<T extends PropTypes>(service: Service<TabsSchema>, normalize: NormalizeProps<T>): TabsApi<T> {
  const { state, send, context, prop, scope } = service

  const translations = prop("translations")
  const focused = state.matches("focused")

  const isVertical = prop("orientation") === "vertical"
  const isHorizontal = prop("orientation") === "horizontal"
  const composite = prop("composite")

  function getTriggerState(props: TriggerProps): TriggerState {
    return {
      selected: context.get("value") === props.value,
      focused: context.get("focusedValue") === props.value,
      disabled: !!props.disabled,
    }
  }

  return {
    value: context.get("value"),
    focusedValue: context.get("focusedValue"),
    setValue(value) {
      send({ type: "SET_VALUE", value })
    },
    clearValue() {
      send({ type: "CLEAR_VALUE" })
    },
    setIndicatorRect(value) {
      const id = dom.getTriggerId(scope, value)
      send({ type: "SET_INDICATOR_RECT", id })
    },
    syncTabIndex() {
      send({ type: "SYNC_TAB_INDEX" })
    },
    selectNext(fromValue) {
      send({ type: "TAB_FOCUS", value: fromValue, src: "selectNext" })
      send({ type: "ARROW_NEXT", src: "selectNext" })
    },
    selectPrev(fromValue) {
      send({ type: "TAB_FOCUS", value: fromValue, src: "selectPrev" })
      send({ type: "ARROW_PREV", src: "selectPrev" })
    },
    focus() {
      const value = context.get("value")
      if (!value) return
      dom.getTriggerEl(scope, value)?.focus()
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        "data-orientation": prop("orientation"),
        "data-focus": dataAttr(focused),
        dir: prop("dir"),
      })
    },

    getListProps() {
      return normalize.element({
        ...parts.list.attrs,
        id: dom.getListId(scope),
        role: "tablist",
        dir: prop("dir"),
        "data-focus": dataAttr(focused),
        "aria-orientation": prop("orientation"),
        "data-orientation": prop("orientation"),
        "aria-label": translations?.listLabel,
        onKeyDown(event) {
          if (event.defaultPrevented) return

          if (!isSelfTarget(event)) return
          if (isComposingEvent(event)) return

          const keyMap: EventKeyMap = {
            ArrowDown() {
              if (isHorizontal) return
              send({ type: "ARROW_NEXT", key: "ArrowDown" })
            },
            ArrowUp() {
              if (isHorizontal) return
              send({ type: "ARROW_PREV", key: "ArrowUp" })
            },
            ArrowLeft() {
              if (isVertical) return
              send({ type: "ARROW_PREV", key: "ArrowLeft" })
            },
            ArrowRight() {
              if (isVertical) return
              send({ type: "ARROW_NEXT", key: "ArrowRight" })
            },
            Home() {
              send({ type: "HOME" })
            },
            End() {
              send({ type: "END" })
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
        ...parts.trigger.attrs,
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
        "data-ownedby": dom.getListId(scope),
        "data-ssr": dataAttr(context.get("ssr")),
        id: dom.getTriggerId(scope, value),
        tabIndex: triggerState.selected && composite ? 0 : -1,
        onFocus() {
          send({ type: "TAB_FOCUS", value })
        },
        onBlur(event) {
          const target = event.relatedTarget as HTMLElement | null
          if (target?.getAttribute("role") !== "tab") {
            send({ type: "TAB_BLUR" })
          }
        },
        onClick(event) {
          if (event.defaultPrevented) return
          if (isOpeningInNewTab(event)) return
          if (disabled) return
          if (isSafari()) {
            event.currentTarget.focus()
          }
          send({ type: "TAB_CLICK", value })
        },
      })
    },

    getContentProps(props) {
      const { value } = props
      const selected = context.get("value") === value
      return normalize.element({
        ...parts.content.attrs,
        dir: prop("dir"),
        id: dom.getContentId(scope, value),
        tabIndex: composite ? 0 : -1,
        "aria-labelledby": dom.getTriggerId(scope, value),
        role: "tabpanel",
        "data-ownedby": dom.getListId(scope),
        "data-selected": dataAttr(selected),
        "data-orientation": prop("orientation"),
        hidden: !selected,
      })
    },

    getIndicatorProps() {
      const indicatorRect = context.get("indicatorRect")
      const indicatorTransition = context.get("indicatorTransition")
      const indicatorDisabled = context.get("indicatorDisabled")

      return normalize.element({
        id: dom.getIndicatorId(scope),
        ...parts.indicator.attrs,
        dir: prop("dir"),
        "data-orientation": prop("orientation"),
        "data-disabled": dataAttr(indicatorDisabled),
        style: {
          "--transition-property": "left, right, top, bottom, width, height",
          "--left": indicatorRect.left,
          "--top": indicatorRect.top,
          "--width": indicatorRect.width,
          "--height": indicatorRect.height,
          position: "absolute",
          willChange: "var(--transition-property)",
          transitionProperty: "var(--transition-property)",
          transitionDuration: indicatorTransition ? "var(--transition-duration, 150ms)" : "0ms",
          transitionTimingFunction: "var(--transition-timing-function)",
          [isHorizontal ? "left" : "top"]: isHorizontal ? "var(--left)" : "var(--top)",
        },
      })
    },
  }
}
