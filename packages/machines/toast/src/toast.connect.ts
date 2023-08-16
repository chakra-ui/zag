import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./toast.anatomy"
import { dom } from "./toast.dom"
import type { MachineApi, Send, State } from "./toast.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
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

    rootProps: normalize.element({
      ...parts.root.attrs,
      dir: state.context.dir,
      id: dom.getRootId(state.context),
      "data-state": isVisible ? "open" : "closed",
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
      ...parts.title.attrs,
      id: dom.getTitleId(state.context),
    }),

    descriptionProps: normalize.element({
      ...parts.description.attrs,
      id: dom.getDescriptionId(state.context),
    }),

    closeTriggerProps: normalize.button({
      id: dom.getCloseTriggerId(state.context),
      ...parts.closeTrigger.attrs,
      type: "button",
      "aria-label": "Dismiss notification",
      onClick() {
        send("DISMISS")
      },
    }),
  }
}
