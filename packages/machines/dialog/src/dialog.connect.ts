import type { Service } from "@zag-js/core"
import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./dialog.anatomy"
import * as dom from "./dialog.dom"
import type { DialogApi, DialogSchema, TriggerProps } from "./dialog.types"

export function connect<T extends PropTypes>(
  service: Service<DialogSchema>,
  normalize: NormalizeProps<T>,
): DialogApi<T> {
  const { state, send, context, prop, scope } = service
  const ariaLabel = prop("aria-label")
  const open = state.matches("open")
  const triggerValue = context.get("triggerValue")

  return {
    open,
    setOpen(nextOpen) {
      const open = state.matches("open")
      if (open === nextOpen) return
      send({ type: nextOpen ? "OPEN" : "CLOSE" })
    },

    triggerValue,
    setTriggerValue(value) {
      send({ type: "ACTIVE_TRIGGER.SET", value })
    },

    getTriggerProps(props: TriggerProps = {}) {
      const { value } = props
      const current = value == null ? false : triggerValue === value
      return normalize.button({
        ...parts.trigger.attrs,
        dir: prop("dir"),
        id: dom.getTriggerId(scope, value),
        "data-ownedby": scope.id,
        "data-value": value,
        "aria-haspopup": "dialog",
        type: "button",
        "aria-expanded": open,
        "data-state": open ? "open" : "closed",
        "aria-controls": dom.getContentId(scope),
        "data-current": dataAttr(current),
        onClick(event) {
          if (event.defaultPrevented) return
          const shouldSwitch = open && !current
          send({ type: shouldSwitch ? "ACTIVE_TRIGGER.SET" : "TOGGLE", value })
        },
      })
    },

    getBackdropProps() {
      return normalize.element({
        ...parts.backdrop.attrs,
        dir: prop("dir"),
        hidden: !open,
        id: dom.getBackdropId(scope),
        "data-state": open ? "open" : "closed",
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        dir: prop("dir"),
        id: dom.getPositionerId(scope),
        style: {
          pointerEvents: open ? undefined : "none",
        },
      })
    },

    getContentProps() {
      const rendered = context.get("rendered")
      return normalize.element({
        ...parts.content.attrs,
        dir: prop("dir"),
        role: prop("role"),
        hidden: !open,
        id: dom.getContentId(scope),
        tabIndex: -1,
        "data-state": open ? "open" : "closed",
        "aria-modal": true,
        "aria-label": ariaLabel || undefined,
        "aria-labelledby": ariaLabel || !rendered.title ? undefined : dom.getTitleId(scope),
        "aria-describedby": rendered.description ? dom.getDescriptionId(scope) : undefined,
      })
    },

    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs,
        dir: prop("dir"),
        id: dom.getTitleId(scope),
      })
    },

    getDescriptionProps() {
      return normalize.element({
        ...parts.description.attrs,
        dir: prop("dir"),
        id: dom.getDescriptionId(scope),
      })
    },

    getCloseTriggerProps() {
      return normalize.button({
        ...parts.closeTrigger.attrs,
        dir: prop("dir"),
        id: dom.getCloseTriggerId(scope),
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return
          event.stopPropagation()
          send({ type: "CLOSE" })
        },
      })
    },
  }
}
