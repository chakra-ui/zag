import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./hover-card.anatomy"
import * as dom from "./hover-card.dom"
import type { HoverCardApi, HoverCardService } from "./hover-card.types"

export function connect<T extends PropTypes>(service: HoverCardService, normalize: NormalizeProps<T>): HoverCardApi<T> {
  const { state, send, prop, context, scope } = service

  const open = state.hasTag("open")

  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: context.get("currentPlacement"),
  })

  return {
    open: open,
    setOpen(nextOpen) {
      if (nextOpen === open) return
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

    getTriggerProps() {
      return normalize.element({
        ...parts.trigger.attrs,
        dir: prop("dir"),
        "data-placement": context.get("currentPlacement"),
        id: dom.getTriggerId(scope),
        "data-state": open ? "open" : "closed",
        onPointerEnter(event) {
          if (event.pointerType === "touch") return
          send({ type: "POINTER_ENTER", src: "trigger" })
        },
        onPointerLeave(event) {
          if (event.pointerType === "touch") return
          send({ type: "POINTER_LEAVE", src: "trigger" })
        },
        onFocus() {
          send({ type: "TRIGGER_FOCUS" })
        },
        onBlur() {
          send({ type: "TRIGGER_BLUR" })
        },
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
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-placement": context.get("currentPlacement"),
        onPointerEnter(event) {
          if (event.pointerType === "touch") return
          send({ type: "POINTER_ENTER", src: "content" })
        },
        onPointerLeave(event) {
          if (event.pointerType === "touch") return
          send({ type: "POINTER_LEAVE", src: "content" })
        },
      })
    },
  }
}
