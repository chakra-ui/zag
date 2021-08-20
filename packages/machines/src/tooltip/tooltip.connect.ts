import { StateMachine as S } from "@ui-machines/core"
import { snapshot } from "valtio"
import { ButtonProps, HTMLProps } from "../utils/types"
import { defaultPropNormalizer } from "../utils/dom-attr"
import { TooltipMachineContext, TooltipMachineState, tooltipStore } from "./tooltip.machine"

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

  return {
    isVisible,
    getIsVisible(globalId: string | null) {
      return ctx.id === globalId && state.matches("open", "closing")
    },
    triggerProps: normalize<ButtonProps>({
      "aria-describedby": isVisible ? `tooltip-${ctx.id}` : undefined,
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
    }),

    tooltipProps: normalize<HTMLProps>({
      role: "tooltip",
    }),
  }
}
