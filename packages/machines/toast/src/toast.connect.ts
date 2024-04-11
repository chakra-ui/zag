import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./toast.anatomy"
import { dom } from "./toast.dom"
import type { MachineApi, Send, State } from "./toast.types"
import { getGhostAfterStyle, getGhostBeforeStyle } from "./toast.utils"

export function connect<T extends PropTypes, O>(
  state: State<O>,
  send: Send,
  normalize: NormalizeProps<T>,
): MachineApi<T, O> {
  const isVisible = state.hasTag("visible")
  const isPaused = state.hasTag("paused")

  const pauseOnInteraction = state.context.pauseOnInteraction
  const placement = state.context.placement!
  const type = state.context.type

  const [side, align = "center"] = placement.split("-")

  return {
    type: type,
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
      ...parts.root.attrs,
      dir: state.context.dir,
      id: dom.getRootId(state.context),
      "data-state": isVisible ? "open" : "closed",
      "data-type": type,
      "data-placement": placement,
      "data-align": align,
      "data-side": side,
      "data-mounted": dataAttr(state.context.mounted),

      "data-first": dataAttr(state.context.frontmost),
      "data-sibling": dataAttr(!state.context.frontmost),
      "data-stack": dataAttr(state.context.stacked),
      "data-overlap": dataAttr(!state.context.stacked),

      role: "status",
      "aria-atomic": "true",
      tabIndex: 0,
      style: {
        position: "absolute",
        pointerEvents: "auto",
        "--remove-delay": `${state.context.removeDelay}ms`,
        "--duration": `${type === "loading" ? Number.MAX_SAFE_INTEGER : state.context.duration}ms`,
        "--initial-height": `${state.context.height}px`,
        "--offset": `${state.context.offset}px`,
        "--index": state.context.index,
        "--z-index": state.context.zIndex,
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

    ghostBeforeProps: normalize.element({
      ...parts.ghost.attrs,
      style: getGhostBeforeStyle(state.context, isVisible),
    }),

    /* Needed to avoid setting hover to false when in between toasts */
    ghostAfterProps: normalize.element({
      ...parts.ghost.attrs,
      style: getGhostAfterStyle(state.context, isVisible),
    }),

    titleProps: normalize.element({
      ...parts.title.attrs,
      id: dom.getTitleId(state.context),
    }),

    descriptionProps: normalize.element({
      ...parts.description.attrs,
      id: dom.getDescriptionId(state.context),
    }),

    actionTriggerProps: normalize.button({
      ...parts.actionTrigger.attrs,
      type: "button",
      onClick() {
        send("DISMISS")
      },
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
