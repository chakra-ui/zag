import { StateMachine as S } from "@ui-machines/core"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/prop-types"
import { dataAttr } from "../utils"
import { ToastMachineContext, ToastMachineState } from "./toast.types"
import { dom } from "./toast.dom"
import { getPlacementStyle } from "./toast.utils"

export function toastConnect<T extends PropTypes = ReactPropTypes>(
  state: S.State<ToastMachineContext, ToastMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state
  const isVisible = state.matches("active", "active:temp", "visible")

  return {
    type: ctx.type,
    placement: ctx.placement,
    isVisible,

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

    containerProps: normalize.element<T>({
      id: dom.getToastContainerId(ctx),
      "data-placement": ctx.placement,
      "data-open": dataAttr(isVisible),
      style: getPlacementStyle(ctx.placement),
    }),

    rootProps: normalize.element<T>({
      id: dom.getRootId(ctx),
      "data-open": dataAttr(isVisible),
      "data-type": ctx.type,
      onPointerEnter() {
        if (ctx.pauseOnHover) {
          send("PAUSE")
        }
      },
      onPointerLeave() {
        if (ctx.pauseOnHover) {
          send("RESUME")
        }
      },
    }),

    titleProps: normalize.element<T>({
      id: dom.getToastTitleId(ctx),
    }),
  }
}
