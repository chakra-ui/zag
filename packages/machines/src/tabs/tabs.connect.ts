import { env, cast } from "@core-foundation/utils"
import { StateMachine as S } from "@ui-machines/core"
import { defaultPropNormalizer, determineEventKey, PropNormalizer } from "../__utils/dom"
import { ButtonProps, HTMLProps, EventKeyMap } from "../__utils/types"
import { getElementIds } from "./tabs.dom"
import { TabsMachineContext, TabsMachineState } from "./tabs.machine"

export function connectTabsMachine(
  state: S.State<TabsMachineContext, TabsMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize: PropNormalizer = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const ids = getElementIds(ctx.uid)

  return {
    tablistProps: normalize<HTMLProps>({
      id: ids.tablist,
      role: "tablist",
      "aria-orientation": ctx.orientation,
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
          ArrowDown() {
            send("TABLIST_ARROW_DOWN")
          },
          ArrowUp() {
            send("TABLIST_ARROW_UP")
          },
          ArrowLeft() {
            send("TABLIST_ARROW_LEFT")
          },
          ArrowRight() {
            send("TABLIST_ARROW_RIGHT")
          },
          Home() {
            send("TABLIST_HOME")
          },
          End() {
            send("TABLIST_END")
          },
          Enter() {
            send({ type: "TABLIST_ENTER", uid: ctx.focusedTabId })
          },
        }

        let key = determineEventKey(event, ctx)
        const exec = keyMap[key]

        if (exec) {
          event.preventDefault()
          exec(event)
        }
      },
    }),

    getTabProps({ uid }: { uid: string }) {
      const selected = ctx.activeTabId === uid
      return normalize<ButtonProps>({
        role: "tab",
        type: "button",
        "data-uid": uid,
        "aria-selected": selected,
        "aria-controls": ids.getPanelId(uid),
        "data-ownedby": ids.tablist,
        id: ids.getTabId(uid),
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
          if (env.safari()) {
            event.currentTarget.focus()
          }
        },
      })
    },

    getTabPanelProps({ uid }: { uid: string }) {
      const selected = ctx.activeTabId === uid
      return normalize<HTMLProps>({
        id: ids.getPanelId(uid),
        tabIndex: 0,
        "aria-labelledby": ids.getTabId(uid),
        role: "tabpanel",
        "data-ownedby": ids.tablist,
        hidden: !selected,
      })
    },

    tabIndicatorProps: normalize<HTMLProps>({
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
