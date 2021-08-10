import { StateMachine as S } from "@ui-machines/core"
import { snapshot } from "valtio"
import { DOMButtonProps, DOMHTMLProps } from "../type-utils"
import { defaultPropNormalizer, PropNormalizer } from "../dom-utils"
import { TooltipMachineContext, TooltipMachineState, tooltipStore } from "./tooltip.machine"

export function connectTooltipMachine(
  state: S.State<TooltipMachineContext, TooltipMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize: PropNormalizer = defaultPropNormalizer,
) {
  const { context: ctx } = state

  const snap = snapshot(tooltipStore)

  const isVisible = snap.id === ctx.id && state.matches("open", "closing")

  if (state.matches("closing") && !isVisible) {
    send("FORCE_CLOSE")
  }

  return {
    isVisible,

    triggerProps: normalize<DOMButtonProps>({
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
      onPointerEnter() {
        send("POINTER_ENTER")
      },
      onPointerLeave() {
        send("POINTER_LEAVE")
      },
    }),

    tooltipProps: normalize<DOMHTMLProps>({
      role: "tooltip",
    }),
  }
}
