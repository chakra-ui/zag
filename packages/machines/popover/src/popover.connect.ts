import { dataAttr, isLeftClick, isSafari } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./popover.anatomy"
import * as dom from "./popover.dom"
import type { PopoverApi, PopoverService } from "./popover.types"

export function connect<T extends PropTypes>(service: PopoverService, normalize: NormalizeProps<T>): PopoverApi<T> {
  const { state, context, send, computed, prop, scope } = service
  const open = state.matches("open")

  const currentPlacement = context.get("currentPlacement")
  const portalled = computed("currentPortalled")
  const rendered = context.get("renderedElements")

  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: currentPlacement,
  })

  return {
    portalled,
    open: open,
    setOpen(nextOpen) {
      const open = state.matches("open")
      if (open === nextOpen) return
      send({ type: nextOpen ? "OPEN" : "CLOSE" })
    },
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },

    getArrowProps() {
      return normalize.element({
        id: dom.getArrowId(scope),
        ...parts.arrow.attrs,
        dir: prop("dir"),
        style: popperStyles.arrow,
      })
    },

    getArrowTipProps() {
      return normalize.element({
        ...parts.arrowTip.attrs,
        dir: prop("dir"),
        style: popperStyles.arrowTip,
      })
    },

    getAnchorProps() {
      return normalize.element({
        ...parts.anchor.attrs,
        dir: prop("dir"),
        id: dom.getAnchorId(scope),
      })
    },

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        dir: prop("dir"),
        type: "button",
        "data-placement": currentPlacement,
        id: dom.getTriggerId(scope),
        "aria-haspopup": "dialog",
        "aria-expanded": open,
        "data-state": open ? "open" : "closed",
        "aria-controls": dom.getContentId(scope),
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          if (isSafari()) {
            event.currentTarget.focus()
          }
        },
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: "TOGGLE" })
        },
        onBlur(event) {
          send({ type: "TRIGGER_BLUR", target: event.relatedTarget })
        },
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        dir: prop("dir"),
        "data-state": open ? "open" : "closed",
      })
    },

    getPositionerProps() {
      return normalize.element({
        id: dom.getPositionerId(scope),
        ...parts.positioner.attrs,
        dir: prop("dir"),
        style: popperStyles.floating,
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        dir: prop("dir"),
        id: dom.getContentId(scope),
        tabIndex: -1,
        role: "dialog",
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-expanded": dataAttr(open),
        "aria-labelledby": rendered.title ? dom.getTitleId(scope) : undefined,
        "aria-describedby": rendered.description ? dom.getDescriptionId(scope) : undefined,
        "data-placement": currentPlacement,
      })
    },

    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs,
        id: dom.getTitleId(scope),
        dir: prop("dir"),
      })
    },

    getDescriptionProps() {
      return normalize.element({
        ...parts.description.attrs,
        id: dom.getDescriptionId(scope),
        dir: prop("dir"),
      })
    },

    getCloseTriggerProps() {
      return normalize.button({
        ...parts.closeTrigger.attrs,
        dir: prop("dir"),
        id: dom.getCloseTriggerId(scope),
        type: "button",
        "aria-label": "close",
        onClick(event) {
          if (event.defaultPrevented) return
          event.stopPropagation()
          send({ type: "CLOSE" })
        },
      })
    },
  }
}
