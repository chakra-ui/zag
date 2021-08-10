import { StateMachine as S } from "@ui-machines/core"
import { DOMHTMLProps, WithDataAttr } from "../type-utils"
import { defaultPropNormalizer, PropNormalizer } from "../dom-utils"
import { ToastMachineContext, ToastMachineState, ToastPlacement } from "./toast.machine"
import { getPlacementStyle } from "./toast.utils"

export function connectToastMachine(
  state: S.State<ToastMachineContext, ToastMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize: PropNormalizer = defaultPropNormalizer,
) {
  const { context: ctx } = state

  return {
    isVisible: state.matches("active", "active:temp", "visible"),

    progressProps: normalize<DOMHTMLProps>({
      role: "progressbar",
      "aria-valuemin": 0,
      "aria-valuemax": ctx.progress?.max,
      "aria-valuenow": ctx.progress?.value,
    }),

    pause() {
      send("PAUSE")
    },

    resume() {
      send("RESUME")
    },

    dismiss() {
      send("DISMISS")
    },

    getContainerProps(placement: ToastPlacement) {
      return normalize<WithDataAttr<DOMHTMLProps>>({
        id: `toast-group-${placement}`,
        "data-placement": placement,
        style: getPlacementStyle(placement),
      })
    },
  }
}
