import { StateMachine as S } from "@ui-machines/core"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/prop-types"
import { cast } from "tiny-fn"
import { isSafari } from "tiny-guard"
import type { EventKeyMap } from "../utils"
import { getEventKey } from "../utils"
import { dom } from "./tabs.dom"
import { TabsMachineContext, TabsMachineState } from "./tabs.machine"

export function tabsConnect<T extends PropTypes = ReactPropTypes>(
  state: S.State<TabsMachineContext, TabsMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state

  return {
    value: ctx.value,
    focusedValue: ctx.focusedValue,
    setValue(value: string) {
      send({ type: "SET_VALUE", value })
    },
    tablistProps: normalize.element<T>({
      id: dom.getTablistId(ctx),
      role: "tablist",
      "aria-orientation": ctx.orientation,
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
            send({ type: "ENTER", value: ctx.focusedValue })
          },
        }

        let key = getEventKey(event, ctx)
        const exec = keyMap[key]

        if (exec) {
          event.preventDefault()
          exec(event)
        }
      },
    }),

    getTabProps({ value }: { value: string }) {
      const selected = ctx.value === value
      return normalize.button<T>({
        role: "tab",
        type: "button",
        "data-value": value,
        "aria-selected": selected,
        "aria-controls": dom.getPanelId(ctx, value),
        "data-ownedby": dom.getTablistId(ctx),
        id: dom.getTabId(ctx, value),
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
          send({ type: "TAB_CLICK", value })
          // ensure browser focus for safari
          if (isSafari()) {
            event.currentTarget.focus()
          }
        },
      })
    },

    getTabPanelProps({ value }: { value: string }) {
      const selected = ctx.value === value
      return normalize.element<T>({
        id: dom.getPanelId(ctx, value),
        tabIndex: 0,
        "aria-labelledby": dom.getTabId(ctx, value),
        role: "tabpanel",
        "data-ownedby": dom.getTablistId(ctx),
        hidden: !selected,
      })
    },

    tabIndicatorProps: normalize.element<T>({
      style: {
        position: "absolute",
        willChange: "left, right, top, bottom, width, height",
        transitionProperty: "left, right, top, bottom, width, height",
        transitionDuration: ctx.measuredRect ? "200ms" : "0ms",
        ...cast(ctx.indicatorRect),
      },
    }),
  }
}
