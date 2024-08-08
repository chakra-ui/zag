import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./toast.anatomy"
import { dom } from "./toast.dom"
import type { MachineApi, Send, State } from "./toast.types"
import { getGhostAfterStyle, getGhostBeforeStyle, getPlacementStyle } from "./toast.utils"

export function connect<T extends PropTypes, O>(
  state: State<O>,
  send: Send,
  normalize: NormalizeProps<T>,
): MachineApi<T, O> {
  const visible = state.hasTag("visible")
  const paused = state.hasTag("paused")

  const placement = state.context.placement!
  const type = state.context.type!

  const [side, align = "center"] = placement.split("-")

  return {
    type: type,
    title: state.context.title,
    description: state.context.description,
    placement,
    visible: visible,
    paused: paused,

    pause() {
      send("PAUSE")
    },

    resume() {
      send("RESUME")
    },

    dismiss() {
      send("DISMISS")
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: state.context.dir,
        id: dom.getRootId(state.context),
        "data-state": visible ? "open" : "closed",
        "data-type": type,
        "data-placement": placement,
        "data-align": align,
        "data-side": side,
        "data-mounted": dataAttr(state.context.mounted),
        "data-paused": dataAttr(paused),

        "data-first": dataAttr(state.context.frontmost),
        "data-sibling": dataAttr(!state.context.frontmost),
        "data-stack": dataAttr(state.context.stacked),
        "data-overlap": dataAttr(!state.context.stacked),

        role: "status",
        "aria-atomic": "true",
        "aria-describedby": state.context.description ? dom.getDescriptionId(state.context) : undefined,
        "aria-labelledby": state.context.title ? dom.getTitleId(state.context) : undefined,
        tabIndex: 0,
        style: getPlacementStyle(state.context, visible),
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (event.key == "Escape") {
            send("DISMISS")
            event.preventDefault()
          }
        },
      })
    },

    /* Leave a ghost div to avoid setting hover to false when transitioning out */
    getGhostBeforeProps() {
      return normalize.element({
        "data-ghost": "before",
        style: getGhostBeforeStyle(state.context, visible),
      })
    },

    /* Needed to avoid setting hover to false when in between toasts */
    getGhostAfterProps() {
      return normalize.element({
        "data-ghost": "after",
        style: getGhostAfterStyle(state.context, visible),
      })
    },

    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs,
        id: dom.getTitleId(state.context),
      })
    },

    getDescriptionProps() {
      return normalize.element({
        ...parts.description.attrs,
        id: dom.getDescriptionId(state.context),
      })
    },

    getActionTriggerProps() {
      return normalize.button({
        ...parts.actionTrigger.attrs,
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return
          send("DISMISS")
        },
      })
    },

    getCloseTriggerProps() {
      return normalize.button({
        id: dom.getCloseTriggerId(state.context),
        ...parts.closeTrigger.attrs,
        type: "button",
        "aria-label": "Dismiss notification",
        onClick(event) {
          if (event.defaultPrevented) return
          send("DISMISS")
        },
      })
    },
  }
}
