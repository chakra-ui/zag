import { StateMachine as S } from "@ui-machines/core"
import { cast } from "tiny-fn"
import { isSafari } from "tiny-guard"
import type { DOM, Props } from "../utils"
import { defaultPropNormalizer, getEventKey } from "../utils"
import { dom } from "./tabs.dom"
import { TabsMachineContext, TabsMachineState } from "./tabs.machine"

export function tabsConnect(
  state: S.State<TabsMachineContext, TabsMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state

  return {
    tablistProps: normalize<Props.Element>({
      id: dom.getTablistId(ctx),
      role: "tablist",
      "aria-orientation": ctx.orientation,
      onKeyDown(event) {
        const keyMap: DOM.EventKeyMap = {
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
            send({ type: "ENTER", uid: ctx.focusedId })
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

    getTabProps({ uid }: { uid: string }) {
      const selected = ctx.activeId === uid
      return normalize<Props.Button>({
        role: "tab",
        type: "button",
        "data-uid": uid,
        "aria-selected": selected,
        "aria-controls": dom.getPanelId(ctx, uid),
        "data-ownedby": dom.getTablistId(ctx),
        id: dom.getTabId(ctx, uid),
        tabIndex: selected ? 0 : -1,
        onFocus() {
          send({ type: "TAB_FOCUS", uid })
        },
        onBlur(event) {
          const target = event.relatedTarget as HTMLElement | null
          if (target?.getAttribute("role") !== "tab") {
            send({ type: "TAB_BLUR" })
          }
        },
        onClick(event) {
          send({ type: "TAB_CLICK", uid })
          // ensure browser focus for safari
          if (isSafari()) {
            event.currentTarget.focus()
          }
        },
      })
    },

    getTabPanelProps({ uid }: { uid: string }) {
      const selected = ctx.activeId === uid
      return normalize<Props.Element>({
        id: dom.getPanelId(ctx, uid),
        tabIndex: 0,
        "aria-labelledby": dom.getTabId(ctx, uid),
        role: "tabpanel",
        "data-ownedby": dom.getTablistId(ctx),
        hidden: !selected,
      })
    },

    tabIndicatorProps: normalize<Props.Element>({
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
