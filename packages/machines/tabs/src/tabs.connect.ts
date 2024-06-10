import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { dataAttr, isComposingEvent, isSafari, isSelfTarget } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tabs.anatomy"
import { dom } from "./tabs.dom"
import type { MachineApi, Send, State, TriggerProps, TriggerState } from "./tabs.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const translations = state.context.translations
  const focused = state.matches("focused")

  const isVertical = state.context.orientation === "vertical"
  const isHorizontal = state.context.orientation === "horizontal"
  const composite = state.context.composite
  const indicator = state.context.indicatorState

  function getTriggerState(props: TriggerProps): TriggerState {
    return {
      selected: state.context.value === props.value,
      focused: state.context.focusedValue === props.value,
      disabled: !!props.disabled,
    }
  }

  return {
    value: state.context.value,
    focusedValue: state.context.focusedValue,
    setValue(value) {
      send({ type: "SET_VALUE", value })
    },
    clearValue() {
      send({ type: "CLEAR_VALUE" })
    },
    setIndicatorRect(value) {
      const id = dom.getTriggerId(state.context, value)
      send({ type: "SET_INDICATOR_RECT", id })
    },
    syncTabIndex() {
      send("SYNC_TAB_INDEX")
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
      dom.getSelectedTriggerEl(state.context)?.focus()
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(state.context),
        "data-orientation": state.context.orientation,
        "data-focus": dataAttr(focused),
        dir: state.context.dir,
      })
    },

    getListProps() {
      return normalize.element({
        ...parts.list.attrs,
        id: dom.getListId(state.context),
        role: "tablist",
        dir: state.context.dir,
        "data-focus": dataAttr(focused),
        "aria-orientation": state.context.orientation,
        "data-orientation": state.context.orientation,
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
              send("HOME")
            },
            End() {
              send("END")
            },
            Enter() {
              send({ type: "ENTER" })
            },
          }

          let key = getEventKey(event, state.context)
          const exec = keyMap[key]

          if (exec) {
            event.preventDefault()
            exec(event)
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
        dir: state.context.dir,
        "data-orientation": state.context.orientation,
        "data-disabled": dataAttr(disabled),
        "aria-disabled": disabled,
        "data-value": value,
        "aria-selected": triggerState.selected,
        "data-selected": dataAttr(triggerState.selected),
        "data-focus": dataAttr(triggerState.focused),
        "aria-controls": triggerState.selected ? dom.getContentId(state.context, value) : undefined,
        "data-ownedby": dom.getListId(state.context),
        "data-ssr": dataAttr(state.context.ssr),
        id: dom.getTriggerId(state.context, value),
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
      const selected = state.context.value === value
      return normalize.element({
        ...parts.content.attrs,
        dir: state.context.dir,
        id: dom.getContentId(state.context, value),
        tabIndex: composite ? 0 : -1,
        "aria-labelledby": dom.getTriggerId(state.context, value),
        role: "tabpanel",
        "data-ownedby": dom.getListId(state.context),
        "data-selected": dataAttr(selected),
        "data-orientation": state.context.orientation,
        hidden: !selected,
      })
    },

    getIndicatorProps() {
      return normalize.element({
        id: dom.getIndicatorId(state.context),
        ...parts.indicator.attrs,
        dir: state.context.dir,
        "data-orientation": state.context.orientation,
        style: {
          "--transition-property": "left, right, top, bottom, width, height",
          "--left": indicator.rect?.left,
          "--top": indicator.rect?.top,
          "--width": indicator.rect?.width,
          "--height": indicator.rect?.height,
          position: "absolute",
          willChange: "var(--transition-property)",
          transitionProperty: "var(--transition-property)",
          transitionDuration: indicator.transition ? "var(--transition-duration, 150ms)" : "0ms",
          transitionTimingFunction: "var(--transition-timing-function)",
          [isHorizontal ? "left" : "top"]: isHorizontal ? "var(--left)" : "var(--top)",
        },
      })
    },
  }
}
