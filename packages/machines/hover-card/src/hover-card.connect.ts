import { dataAttr } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./hover-card.anatomy"
import * as dom from "./hover-card.dom"
import type { HoverCardApi, HoverCardService, TriggerProps } from "./hover-card.types"

export function connect<T extends PropTypes>(service: HoverCardService, normalize: NormalizeProps<T>): HoverCardApi<T> {
  const { state, send, prop, context, scope } = service

  const open = state.hasTag("open")
  const triggerValue = context.get("triggerValue")

  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: context.get("currentPlacement"),
    positioned: context.get("positioned"),
  })

  return {
    open: open,
    setOpen(nextOpen) {
      const open = state.hasTag("open")
      if (open === nextOpen) return
      if (prop("disabled")) return
      send({ type: nextOpen ? "OPEN" : "CLOSE" })
    },
    triggerValue,
    setTriggerValue(value) {
      send({ type: "TRIGGER_VALUE.SET", value })
    },
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },

    getArrowProps() {
      return normalize.element({
        ...parts.arrow.attrs(scope.id),
        dir: prop("dir"),
        style: popperStyles.arrow,
      })
    },

    getArrowTipProps() {
      return normalize.element({
        ...parts.arrowTip.attrs(scope.id),
        dir: prop("dir"),
        style: popperStyles.arrowTip,
      })
    },

    getTriggerProps(props: TriggerProps = {}) {
      const { value } = props
      const current = value == null ? false : triggerValue === value

      return normalize.element({
        ...parts.trigger.attrs(scope.id),
        dir: prop("dir"),
        "data-placement": context.get("currentPlacement"),
        "data-value": value,
        "data-current": dataAttr(current),
        "data-state": open ? "open" : "closed",
        onPointerEnter(event) {
          if (event.pointerType === "touch") return
          if (prop("disabled")) return
          const shouldSwitch = open && value != null && !current
          send({
            type: shouldSwitch ? "TRIGGER_VALUE.SET" : "POINTER_ENTER",
            src: "trigger",
            value,
          })
        },
        onPointerLeave(event) {
          if (event.pointerType === "touch") return
          if (prop("disabled")) return
          send({ type: "POINTER_LEAVE", src: "trigger" })
        },
        onFocus() {
          if (prop("disabled")) return
          const shouldSwitch = open && value != null && !current
          send({
            type: shouldSwitch ? "TRIGGER_VALUE.SET" : "TRIGGER_FOCUS",
            value,
          })
        },
        onBlur() {
          if (prop("disabled")) return
          send({ type: "TRIGGER_BLUR" })
        },
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs(scope.id),
        dir: prop("dir"),
        style: popperStyles.floating,
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getContentId(scope),
        hidden: !open,
        tabIndex: -1,
        "data-state": open ? "open" : "closed",
        "data-placement": context.get("currentPlacement"),
        onPointerEnter(event) {
          if (event.pointerType === "touch") return
          if (prop("disabled")) return
          send({ type: "POINTER_ENTER", src: "content" })
        },
        onPointerLeave(event) {
          if (event.pointerType === "touch") return
          if (prop("disabled")) return
          send({ type: "POINTER_LEAVE", src: "content" })
        },
      })
    },
  }
}
