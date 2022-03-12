import { StateMachine as S } from "@ui-machines/core"
import { dataAttr } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./toast.dom"
import { MachineContext, MachineState } from "./toast.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: S.State<MachineContext, MachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const isVisible = state.hasTag("visible")

  return {
    type: state.context.type,
    title: state.context.title,
    placement: state.context.placement,
    isVisible,
    progress: state.context.progress,

    pause() {
      send("PAUSE")
    },

    resume() {
      send("RESUME")
    },

    dismiss() {
      send("DISMISS")
    },

    progressProps: normalize.element<T>({
      "data-part": "progress",
      role: "progressbar",
      "aria-valuemin": 0,
      "aria-valuemax": state.context.progress?.max,
      "aria-valuenow": state.context.progress?.value,
      style: {
        "--toast-progress-percent": `${state.context.progress?.value / state.context.progress?.max}%`,
      },
    }),

    containerProps: normalize.element<T>({
      "data-part": "container",
      id: dom.getRootId(state.context),
      "data-open": dataAttr(isVisible),
      "data-type": state.context.type,
      style: {
        pointerEvents: "auto",
        margin: "calc(var(--toast-gutter) / 2)",
        "--toast-remove-delay": `${state.context.removeDelay}ms`,
      },
      onPointerEnter() {
        if (state.context.pauseOnHover) {
          send("PAUSE")
        }
      },
      onPointerLeave() {
        if (state.context.pauseOnHover) {
          send("RESUME")
        }
      },
    }),

    titleProps: normalize.element<T>({
      id: dom.getToastTitleId(state.context),
    }),

    closeButtonProps: normalize.button<T>({
      id: dom.getCloseButtonId(state.context),
      "data-part": "close-button",
      type: "button",
      "aria-label": "Dismiss notification",
      onClick() {
        send("DISMISS")
      },
    }),

    render() {
      return state.context.render?.({
        id: state.context.id,
        type: state.context.type,
        dismiss() {
          send("DISMISS")
        },
      })
    },
  }
}
