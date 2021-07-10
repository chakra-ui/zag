import {
  defaultPropNormalizer,
  PropNormalizer,
  StateMachine as S,
} from "@chakra-ui/machine"
import { cast, isSafari } from "@chakra-ui/utilities"
import { determineEventKey } from "../event-utils"
import {
  DOMButtonProps,
  DOMHTMLProps,
  EventKeyMap,
  WithDataAttr,
} from "../type-utils"
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
    tablistProps: normalize<DOMHTMLProps>({
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
      return normalize<WithDataAttr<DOMButtonProps>>({
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
          if (isSafari()) {
            event.currentTarget.focus()
          }
        },
      })
    },

    getTabPanelProps({ uid }: { uid: string }) {
      const selected = ctx.activeTabId === uid
      return normalize<WithDataAttr<DOMHTMLProps>>({
        id: ids.getPanelId(uid),
        tabIndex: 0,
        "aria-labelledby": ids.getTabId(uid),
        role: "tabpanel",
        "data-ownedby": ids.tablist,
        hidden: !selected,
      })
    },

    tabIndicatorProps: normalize<DOMHTMLProps>({
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
