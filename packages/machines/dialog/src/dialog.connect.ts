import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./dialog.anatomy"
import { dom } from "./dialog.dom"
import type { MachineApi, Send, State } from "./dialog.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const ariaLabel = state.context["aria-label"]
  const isOpen = state.matches("open")
  const rendered = state.context.renderedElements

  return {
    isOpen,
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      dir: state.context.dir,
      id: dom.getTriggerId(state.context),
      "aria-haspopup": "dialog",
      type: "button",
      "aria-expanded": isOpen,
      "data-state": isOpen ? "open" : "closed",
      "aria-controls": dom.getContentId(state.context),
      onClick() {
        send("TOGGLE")
      },
    }),

    backdropProps: normalize.element({
      ...parts.backdrop.attrs,
      dir: state.context.dir,
      hidden: !isOpen,
      id: dom.getBackdropId(state.context),
      "data-state": isOpen ? "open" : "closed",
    }),

    positionerProps: normalize.element({
      ...parts.positioner.attrs,
      dir: state.context.dir,
      id: dom.getPositionerId(state.context),
      style: {
        pointerEvents: isOpen ? undefined : "none",
      },
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      dir: state.context.dir,
      role: state.context.role,
      hidden: !isOpen,
      id: dom.getContentId(state.context),
      tabIndex: -1,
      "data-state": isOpen ? "open" : "closed",
      "aria-modal": true,
      "aria-label": ariaLabel || undefined,
      "aria-labelledby": ariaLabel || !rendered.title ? undefined : dom.getTitleId(state.context),
      "aria-describedby": rendered.description ? dom.getDescriptionId(state.context) : undefined,
    }),

    titleProps: normalize.element({
      ...parts.title.attrs,
      dir: state.context.dir,
      id: dom.getTitleId(state.context),
    }),

    descriptionProps: normalize.element({
      ...parts.description.attrs,
      dir: state.context.dir,
      id: dom.getDescriptionId(state.context),
    }),

    closeTriggerProps: normalize.button({
      ...parts.closeTrigger.attrs,
      dir: state.context.dir,
      id: dom.getCloseTriggerId(state.context),
      type: "button",
      onClick(event) {
        event.stopPropagation()
        send("CLOSE")
      },
    }),
  }
}
