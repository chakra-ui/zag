import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, defaultPropNormalizer, getEventKey } from "../utils"
import type { DOM, Props } from "../utils/types"
import { TooltipMachineContext, TooltipMachineState, tooltipStore } from "./tooltip.machine"

export function tooltipConnect(
  state: S.State<TooltipMachineContext, TooltipMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state

  const isVisible = state.matches("open", "closing")

  const triggerId = `tooltip-${ctx.id}`
  const tooltipId = `tooltip-${ctx.id}-content`

  return {
    isVisible,

    getIsVisible(globalId: string | null) {
      return ctx.id === globalId && state.matches("open", "closing")
    },

    triggerProps: normalize<Props.Button>({
      id: triggerId,
      "data-expanded": dataAttr(isVisible),
      "aria-describedby": isVisible ? tooltipId : undefined,
      "data-controls": "tooltip",
      onFocus() {
        send("FOCUS")
      },
      onBlur() {
        if (ctx.id === tooltipStore.id) {
          send("BLUR")
        }
      },
      onPointerDown() {
        if (ctx.id === tooltipStore.id) {
          send("POINTER_DOWN")
        }
      },
      onPointerMove() {
        send("POINTER_ENTER")
      },
      onPointerLeave() {
        send("POINTER_LEAVE")
      },
      onKeyDown(event) {
        const keymap: DOM.EventKeyMap = {
          Enter() {
            send("PRESS_ENTER")
          },
          Space() {
            send("PRESS_ENTER")
          },
        }
        const key = getEventKey(event)
        const exec = keymap[key]
        if (exec) exec(event)
      },
    }),

    tooltipProps: normalize<Props.Element>({
      role: "tooltip",
      id: tooltipId,
    }),
  }
}
