import { dataAttr } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./popover.anatomy"
import { dom } from "./popover.dom"
import type { MachineApi, Send, State } from "./popover.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const open = state.matches("open")

  const currentPlacement = state.context.currentPlacement
  const portalled = state.context.currentPortalled
  const rendered = state.context.renderedElements

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: currentPlacement,
  })

  return {
    portalled,
    open: open,
    setOpen(nextOpen) {
      if (nextOpen === open) return
      send(nextOpen ? "OPEN" : "CLOSE")
    },
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },

    getArrowProps() {
      return normalize.element({
        id: dom.getArrowId(state.context),
        ...parts.arrow.attrs,
        dir: state.context.dir,
        style: popperStyles.arrow,
      })
    },

    getArrowTipProps() {
      return normalize.element({
        ...parts.arrowTip.attrs,
        dir: state.context.dir,
        style: popperStyles.arrowTip,
      })
    },

    getAnchorProps() {
      return normalize.element({
        ...parts.anchor.attrs,
        dir: state.context.dir,
        id: dom.getAnchorId(state.context),
      })
    },

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        dir: state.context.dir,
        type: "button",
        "data-placement": currentPlacement,
        id: dom.getTriggerId(state.context),
        "aria-haspopup": "dialog",
        "aria-expanded": open,
        "data-state": open ? "open" : "closed",
        "aria-controls": dom.getContentId(state.context),
        onClick(event) {
          if (event.defaultPrevented) return
          send("TOGGLE")
        },
        onBlur(event) {
          send({ type: "TRIGGER_BLUR", target: event.relatedTarget })
        },
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        dir: state.context.dir,
        "data-state": open ? "open" : "closed",
      })
    },

    getPositionerProps() {
      return normalize.element({
        id: dom.getPositionerId(state.context),
        ...parts.positioner.attrs,
        dir: state.context.dir,
        style: popperStyles.floating,
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        dir: state.context.dir,
        id: dom.getContentId(state.context),
        tabIndex: -1,
        role: "dialog",
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-expanded": dataAttr(open),
        "aria-labelledby": rendered.title ? dom.getTitleId(state.context) : undefined,
        "aria-describedby": rendered.description ? dom.getDescriptionId(state.context) : undefined,
        "data-placement": currentPlacement,
      })
    },

    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs,
        id: dom.getTitleId(state.context),
        dir: state.context.dir,
      })
    },

    getDescriptionProps() {
      return normalize.element({
        ...parts.description.attrs,
        id: dom.getDescriptionId(state.context),
        dir: state.context.dir,
      })
    },

    getCloseTriggerProps() {
      return normalize.button({
        ...parts.closeTrigger.attrs,
        dir: state.context.dir,
        id: dom.getCloseTriggerId(state.context),
        type: "button",
        "aria-label": "close",
        onClick(event) {
          if (event.defaultPrevented) return
          send("CLOSE")
        },
      })
    },
  }
}
