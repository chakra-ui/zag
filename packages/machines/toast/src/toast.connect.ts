import { dataAttr } from "@zag-js/dom-utils"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./toast.dom"
import type { Send, State } from "./toast.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isVisible = state.hasTag("visible")
  const isPaused = state.hasTag("paused")

  const pauseOnInteraction = state.context.pauseOnInteraction
  const placement = state.context.placement

  return {
    type: state.context.type,
    title: state.context.title,
    description: state.context.description,
    placement,
    isVisible,
    isPaused,
    isRtl: state.context.dir === "rtl",
    pause() {
      send("PAUSE")
    },
    resume() {
      send("RESUME")
    },
    dismiss() {
      send("DISMISS")
    },

    rootProps: normalize.element({
      "data-scope": "toast",
      "data-part": "root",
      dir: state.context.dir,
      id: dom.getContainerId(state.context),
      "data-open": dataAttr(isVisible),
      "data-type": state.context.type,
      "data-placement": placement,
      role: "status",
      "aria-atomic": "true",
      tabIndex: 0,
      style: {
        position: "relative",
        pointerEvents: "auto",
        margin: "calc(var(--toast-gutter) / 2)",
        "--remove-delay": `${state.context.removeDelay}ms`,
        "--duration": `${state.context.duration}ms`,
      },
      onKeyDown(event) {
        if (event.key == "Escape") {
          send("DISMISS")
          event.preventDefault()
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

    titleProps: normalize.element({
      "data-scope": "toast",
      "data-part": "title",
      id: dom.getTitleId(state.context),
    }),

    descriptionProps: normalize.element({
      "data-scope": "toast",
      "data-part": "description",
      id: dom.getDescriptionId(state.context),
    }),

    closeButtonProps: normalize.button({
      id: dom.getCloseButtonId(state.context),
      "data-scope": "toast",
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
        duration: state.context.duration,
        title: state.context.title,
        placement: state.context.placement,
        description: state.context.description,
        dismiss() {
          send("DISMISS")
        },
      })
    },
  }
}
