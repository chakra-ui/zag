import { StateMachine as S } from "@ui-machines/core"
import { snapshot } from "valtio"
import { ButtonProps, EventKeyMap, HTMLProps } from "../utils/types"
import { defaultPropNormalizer, dataAttr } from "../utils/dom-attr"
import { TooltipMachineContext, TooltipMachineState, tooltipStore } from "./tooltip.machine"
import { getEventKey } from "../utils/get-event-key"

export function connectTooltipMachine(
  state: S.State<TooltipMachineContext, TooltipMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state

  const snap = snapshot(tooltipStore)

  const isVisible = snap.id === ctx.id && state.matches("open", "closing")

  if (state.matches("closing") && !isVisible) {
    send("FORCE_CLOSE")
  }

  const triggerId = `tooltip-${ctx.id}`
  const tooltipId = `tooltip-${ctx.id}-content`

  return {
    isVisible,

    getIsVisible(globalId: string | null) {
      return ctx.id === globalId && state.matches("open", "closing")
    },

    triggerProps: normalize<ButtonProps>({
      id: triggerId,
      "data-expanded": dataAttr(isVisible),
      "aria-describedby": isVisible ? tooltipId : undefined,
      "data-controls": "tooltip",
      onFocus() {
        send("POINTER_ENTER")
      },
      onBlur() {
        send("POINTER_LEAVE")
      },
      onPointerDown() {
        send("POINTER_DOWN")
      },
      onPointerMove() {
        send("POINTER_ENTER")
      },
      onPointerLeave() {
        send("POINTER_LEAVE")
      },
      onKeyDown(event) {
        const keymap: EventKeyMap = {
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

    tooltipProps: normalize<HTMLProps>({
      role: "tooltip",
      id: tooltipId,
    }),
  }
}
