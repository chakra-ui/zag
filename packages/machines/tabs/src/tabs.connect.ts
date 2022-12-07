import { dataAttr, EventKeyMap, getEventKey, isSafari } from "@zag-js/dom-utils"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tabs.anatomy"
import { dom } from "./tabs.dom"
import type { Send, State, TabProps } from "./tabs.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const translations = state.context.translations
  const isFocused = state.matches("focused")

  return {
    value: state.context.value,
    focusedValue: state.context.focusedValue,
    previousValues: Array.from(state.context.previousValues),
    setValue(value: string) {
      send({ type: "SET_VALUE", value })
    },
    clearValue() {
      send({ type: "CLEAR_VALUE" })
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
      "data-orientation": state.context.orientation,
      "data-focus": dataAttr(isFocused),
      dir: state.context.dir,
    }),

    triggerGroupProps: normalize.element({
      ...parts.triggerGroup.attrs,
      id: dom.getTriggerGroupId(state.context),
      role: "tablist",
      "data-focus": dataAttr(isFocused),
      "aria-orientation": state.context.orientation,
      "data-orientation": state.context.orientation,
      "aria-label": translations.tablistLabel,
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
          ArrowDown() {
            send("ARROW_DOWN")
          },
          ArrowUp() {
            send("ARROW_UP")
          },
          ArrowLeft() {
            send("ARROW_LEFT")
          },
          ArrowRight() {
            send("ARROW_RIGHT")
          },
          Home() {
            send("HOME")
          },
          End() {
            send("END")
          },
          Enter() {
            send({ type: "ENTER", value: state.context.focusedValue })
          },
        }

        let key = getEventKey(event, state.context)
        const exec = keyMap[key]

        if (exec) {
          event.preventDefault()
          exec(event)
        }
      },
    }),

    getTriggerProps(props: TabProps) {
      const { value, disabled } = props
      const selected = state.context.value === value

      return normalize.button({
        ...parts.trigger.attrs,
        role: "tab",
        type: "button",
        disabled,
        "data-orientation": state.context.orientation,
        "data-disabled": dataAttr(disabled),
        "aria-disabled": disabled,
        "data-value": value,
        "aria-selected": selected,
        "data-selected": dataAttr(selected),
        "aria-controls": dom.getContentId(state.context, value),
        "data-ownedby": dom.getTriggerGroupId(state.context),
        id: dom.getTriggerId(state.context, value),
        tabIndex: selected ? 0 : -1,
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
          if (disabled) return
          if (isSafari()) {
            event.currentTarget.focus()
          }
          send({ type: "TAB_CLICK", value })
        },
      })
    },

    contentGroupProps: normalize.element({
      ...parts.contentGroup.attrs,
      id: dom.getContentGroupId(state.context),
      "data-orientation": state.context.orientation,
    }),

    getContentProps({ value }: { value: string }) {
      const selected = state.context.value === value
      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(state.context, value),
        tabIndex: 0,
        "aria-labelledby": dom.getTriggerId(state.context, value),
        role: "tabpanel",
        "data-ownedby": dom.getTriggerGroupId(state.context),
        hidden: !selected,
      })
    },

    getDeleteButtonProps({ value, disabled }: TabProps) {
      return normalize.button({
        ...parts.deleteButton.attrs,
        type: "button",
        tabIndex: -1,
        "aria-label": translations.deleteLabel?.(value),
        disabled,
        onClick() {
          send({ type: "DELETE", value })
        },
      })
    },

    indicatorProps: normalize.element({
      id: dom.getIndicatorId(state.context),
      ...parts.indicator.attrs,
      "data-orientation": state.context.orientation,
      style: {
        "--transition-duration": "200ms",
        "--transition-property": "left, right, top, bottom, width, height",
        position: "absolute",
        willChange: "var(--transition-property)",
        transitionProperty: "var(--transition-property)",
        transitionDuration: state.context.hasMeasuredRect ? "var(--transition-duration)" : "0ms",
        transitionTimingFunction: "var(--transition-timing-function)",
        ...state.context.indicatorRect,
      },
    }),
  }
}
