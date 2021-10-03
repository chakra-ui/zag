import { StateMachine as S } from "@ui-machines/core"
import { defaultPropNormalizer } from "../utils/dom-attr"
import { Props } from "../utils/types"
import { ToastMachineContext, ToastMachineState, ToastPlacement } from "./toast.machine"
import { getPlacementStyle } from "./toast.utils"

export function toastConnect(
  state: S.State<ToastMachineContext, ToastMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state

  return {
    isVisible: state.matches("active", "active:temp", "visible"),

    progressProps: normalize<Props.Element>({
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
      return normalize<Props.Element>({
        id: `toast-group-${placement}`,
        "data-placement": placement,
        style: getPlacementStyle(placement),
      })
    },
  }
}
