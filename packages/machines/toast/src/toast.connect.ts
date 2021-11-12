import { StateMachine as S } from "@ui-machines/core"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/prop-types"
import { ToastMachineContext, ToastMachineState, ToastPlacement } from "./toast.machine"
import { getPlacementStyle } from "./toast.utils"

export function toastConnect<T extends PropTypes = ReactPropTypes>(
  state: S.State<ToastMachineContext, ToastMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state

  return {
    isVisible: state.matches("active", "active:temp", "visible"),

    progressProps: normalize.element<T>({
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
      return normalize.element<T>({
        id: `toast-group-${placement}`,
        "data-placement": placement,
        style: getPlacementStyle(placement),
      })
    },
  }
}
