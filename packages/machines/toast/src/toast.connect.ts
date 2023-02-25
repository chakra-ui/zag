import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./toast.anatomy"
import { dom } from "./toast.dom"
import type { Send, State } from "./toast.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isVisible = state.hasTag("visible")
  const isPaused = state.hasTag("paused")

  const pauseOnInteraction = state.context.pauseOnInteraction
  const placement = state.context.placement

  return {
    /**
     * The type of the toast.
     */
    type: state.context.type,
    /**
     * The title of the toast.
     */
    title: state.context.title,
    /**
     *  The description of the toast.
     */
    description: state.context.description,
    /**
     * The current placement of the toast.
     */
    placement,
    /**
     * Whether the toast is visible.
     */
    isVisible,
    /**
     * Whether the toast is paused.
     */
    isPaused,
    /**
     * Whether the toast is in RTL mode.
     */
    isRtl: state.context.dir === "rtl",
    /**
     * Function to pause the toast (keeping it visible).
     */
    pause() {
      send("PAUSE")
    },
    /**
     * Function to resume the toast dismissing.
     */
    resume() {
      send("RESUME")
    },
    /**
     * Function to instantly dismiss the toast.
     */
    dismiss() {
      send("DISMISS")
    },
    /**
     * Function render the toast in the DOM (based on the defined `render` property)
     */
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
