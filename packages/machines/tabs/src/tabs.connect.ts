import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, EventKeyMap, getEventKey } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { isSafari } from "@ui-machines/utils"
import { dom } from "./tabs.dom"
import { MachineContext, MachineState, TabProps } from "./tabs.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: S.State<MachineContext, MachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const messages = state.context.messages

  return {
    value: state.context.value,
    focusedValue: state.context.focusedValue,
    setValue(value: string) {
      send({ type: "SET_VALUE", value })
    },

    rootProps: normalize.element<T>({
      "data-part": "root",
      id: dom.getRootId(state.context),
      "data-orientation": state.context.orientation,
      dir: state.context.dir,
    }),

    tablistProps: normalize.element<T>({
      "data-part": "tablist",
      id: dom.getTablistId(state.context),
      role: "tablist",
      "aria-orientation": state.context.orientation,
      "data-orientation": state.context.orientation,
      "aria-label": messages.tablistLabel,
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

    getTabProps(props: TabProps) {
      const { value, disabled } = props
      const selected = state.context.value === value

      return normalize.button<T>({
        "data-part": "tab",
        role: "tab",
        type: "button",
        disabled,
        "data-disabled": dataAttr(disabled),
        "aria-disabled": disabled,
        "data-value": value,
        "aria-selected": selected,
        "data-selected": dataAttr(selected),
        "aria-controls": dom.getPanelId(state.context, value),
        "data-ownedby": dom.getTablistId(state.context),
        id: dom.getTabId(state.context, value),
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

    getTabPanelProps({ value }: { value: string }) {
      const selected = state.context.value === value
      return normalize.element<T>({
        "data-part": "tabpanel",
        id: dom.getPanelId(state.context, value),
        tabIndex: 0,
        "aria-labelledby": dom.getTabId(state.context, value),
        role: "tabpanel",
        "data-ownedby": dom.getTablistId(state.context),
        hidden: !selected,
      })
    },

    getTabDeleteButtonProps({ value }: { value: string }) {
      return normalize.button<T>({
        "data-part": "delete-button",
        type: "button",
        tabIndex: -1,
        "aria-label": messages.deleteLabel?.(value),
        onClick() {
          state.context.onDelete?.(value)
        },
      })
    },

    tabIndicatorProps: normalize.element<T>({
      "data-part": "tab-indicator",
      style: {
        "--transition-duration": "200ms",
        "--transition-property": "left, right, top, bottom, width, height",
        position: "absolute",
        willChange: "var(--transition-property)",
        transitionProperty: "var(--transition-property)",
        transitionDuration: state.context.measuredRect ? "var(--transition-duration)" : "0ms",
        ...state.context.indicatorRect,
      },
    }),
  }
}
