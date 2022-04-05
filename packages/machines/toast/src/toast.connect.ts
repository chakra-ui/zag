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
  const pauseOnInteraction = state.context.pauseOnInteraction
  const placement = state.context.placement

  return {
    type: state.context.type,
    title: state.context.title,
    placement,
    isVisible,
    progress: state.context.progress,
    progressPercent: state.context.progressPercent,

    pause() {
      send("PAUSE")
    },
    resume() {
      send("RESUME")
    },
    dismiss() {
      send("DISMISS")
    },

    rootProps: normalize.element<T>({
      "data-part": "root",
      id: dom.getContainerId(state.context),
      "data-open": dataAttr(isVisible),
      "data-type": state.context.type,
      "data-placement": placement,
      role: "status",
      "aria-atomic": "true",
      tabIndex: 0,
      style: {
        pointerEvents: "auto",
        margin: "calc(var(--toast-gutter) / 2)",
        "--toast-remove-delay": `${state.context.removeDelay}ms`,
        "--toast-progress-percent": `${state.context.progressPercent * 100}%`,
      },
      onKeyDown(event) {
        if (event.key == "Escape") {
          send("DISMISS")
          event.preventDefault()
          event.stopPropagation()
        }
      },
      onFocus() {
        if (pauseOnInteraction) {
          send("PAUSE")
        }
      },
      onBlur() {
        if (pauseOnInteraction) {
          send("RESUME")
        }
      },
      onPointerEnter() {
        if (pauseOnInteraction) {
          send("PAUSE")
        }
      },
      onPointerLeave() {
        if (pauseOnInteraction) {
          send("RESUME")
        }
      },
    }),

    progressProps: normalize.element<T>({
      "data-part": "progress",
      role: "progressbar",
      "aria-valuemin": 0,
      "aria-valuemax": state.context.progress.max,
      "aria-valuenow": state.context.progress.value,
    }),

    titleProps: normalize.element<T>({
      "data-part": "title",
      id: dom.getTitleId(state.context),
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
