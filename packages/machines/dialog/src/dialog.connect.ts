import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./dialog.anatomy"
import { dom } from "./dialog.dom"
import type { MachineApi, Send, State } from "./dialog.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const ariaLabel = state.context["aria-label"]
  const open = state.matches("open")
  const rendered = state.context.renderedElements

  return {
    open,
    setOpen(nextOpen) {
      if (nextOpen === open) return
      send(nextOpen ? "OPEN" : "CLOSE")
    },

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        dir: state.context.dir,
        id: dom.getTriggerId(state.context),
        "aria-haspopup": "dialog",
        type: "button",
        "aria-expanded": open,
        "data-state": open ? "open" : "closed",
        "aria-controls": dom.getContentId(state.context),
        onClick(event) {
          if (event.defaultPrevented) return
          send("TOGGLE")
        },
      })
    },

    getBackdropProps() {
      return normalize.element({
        ...parts.backdrop.attrs,
        dir: state.context.dir,
        hidden: !open,
        id: dom.getBackdropId(state.context),
        "data-state": open ? "open" : "closed",
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        dir: state.context.dir,
        id: dom.getPositionerId(state.context),
        style: {
          pointerEvents: open ? undefined : "none",
        },
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        dir: state.context.dir,
        role: state.context.role,
        hidden: !open,
        id: dom.getContentId(state.context),
        tabIndex: -1,
        "data-state": open ? "open" : "closed",
        "aria-modal": true,
        "aria-label": ariaLabel || undefined,
        "aria-labelledby": ariaLabel || !rendered.title ? undefined : dom.getTitleId(state.context),
        "aria-describedby": rendered.description ? dom.getDescriptionId(state.context) : undefined,
      })
    },

    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs,
        dir: state.context.dir,
        id: dom.getTitleId(state.context),
      })
    },

    getDescriptionProps() {
      return normalize.element({
        ...parts.description.attrs,
        dir: state.context.dir,
        id: dom.getDescriptionId(state.context),
      })
    },

    getCloseTriggerProps() {
      return normalize.button({
        ...parts.closeTrigger.attrs,
        dir: state.context.dir,
        id: dom.getCloseTriggerId(state.context),
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return
          event.stopPropagation()
          send("CLOSE")
        },
      })
    },
  }
}
