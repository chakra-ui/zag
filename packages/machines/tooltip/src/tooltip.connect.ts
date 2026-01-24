import type { Service } from "@zag-js/core"
import { dataAttr, isLeftClick } from "@zag-js/dom-query"
import { isFocusVisible } from "@zag-js/focus-visible"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tooltip.anatomy"
import * as dom from "./tooltip.dom"
import { store } from "./tooltip.store"
import type { TooltipApi, TooltipSchema, TriggerProps } from "./tooltip.types"

export function connect<P extends PropTypes>(
  service: Service<TooltipSchema>,
  normalize: NormalizeProps<P>,
): TooltipApi<P> {
  const { state, context, send, scope, prop, event: _event } = service
  const id = prop("id")
  const hasAriaLabel = !!prop("aria-label")

  const open = state.matches("open", "closing")
  const activeTriggerValue = context.get("activeTriggerValue")

  const contentId = dom.getContentId(scope)

  const disabled = prop("disabled")

  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: context.get("currentPlacement"),
  })

  return {
    open: open,
    setOpen(nextOpen) {
      const open = state.matches("open", "closing")
      if (open === nextOpen) return
      send({ type: nextOpen ? "open" : "close" })
    },

    activeTriggerValue,
    setActiveTriggerValue(value) {
      send({ type: "activeTrigger.set", value: value ?? undefined })
    },

    reposition(options = {}) {
      send({ type: "positioning.set", options })
    },

    getTriggerProps(props: TriggerProps = {}) {
      const { value } = props
      const current = value == null ? false : activeTriggerValue === value
      const triggerId = dom.getTriggerId(scope, value)
      return normalize.button({
        ...parts.trigger.attrs,
        id: triggerId,
        "data-ownedby": scope.id,
        "data-value": value,
        "data-current": dataAttr(current),
        dir: prop("dir"),
        "data-expanded": dataAttr(open),
        "data-state": open ? "open" : "closed",
        "aria-describedby": open ? contentId : undefined,
        onClick(event) {
          if (event.defaultPrevented) return
          if (disabled) return
          if (!prop("closeOnClick")) return
          const shouldSwitch = open && !current
          send({ type: shouldSwitch ? "activeTrigger.set" : "close", src: "trigger.click", value, triggerId })
        },
        onFocus(event) {
          queueMicrotask(() => {
            if (event.defaultPrevented) return
            if (disabled) return
            if (_event.src === "trigger.pointerdown") return
            if (!isFocusVisible()) return
            const shouldSwitch = open && !current
            send({ type: shouldSwitch ? "activeTrigger.set" : "open", src: "trigger.focus", value, triggerId })
          })
        },
        onBlur(event) {
          if (event.defaultPrevented) return
          if (disabled) return
          if (id === store.get("id")) {
            send({ type: "close", src: "trigger.blur", value, triggerId })
          }
        },
        onPointerDown(event) {
          if (event.defaultPrevented) return
          if (disabled) return
          if (!isLeftClick(event)) return
          if (!prop("closeOnPointerDown")) return
          if (id === store.get("id")) {
            send({ type: "close", src: "trigger.pointerdown", value, triggerId })
          }
        },
        onPointerMove(event) {
          if (event.defaultPrevented) return
          if (disabled) return
          if (event.pointerType === "touch") return
          const shouldSwitch = open && !current
          send({ type: shouldSwitch ? "activeTrigger.set" : "pointer.move", value, triggerId })
        },
        onPointerOver(event) {
          if (event.defaultPrevented) return
          if (disabled) return
          if (event.pointerType === "touch") return
          send({ type: "pointer.move" })
        },
        onPointerLeave() {
          if (disabled) return
          send({ type: "pointer.leave" })
        },
        onPointerCancel() {
          if (disabled) return
          send({ type: "pointer.leave" })
        },
      })
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

    getPositionerProps() {
      return normalize.element({
        id: dom.getPositionerId(scope),
        ...parts.positioner.attrs,
        dir: prop("dir"),
        style: popperStyles.floating,
      })
    },

    getContentProps() {
      const isCurrentTooltip = store.get("id") === id
      const isPrevTooltip = store.get("prevId") === id
      const instant = store.get("instant") && ((open && isCurrentTooltip) || isPrevTooltip)

      return normalize.element({
        ...parts.content.attrs,
        dir: prop("dir"),
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-instant": dataAttr(instant),
        role: hasAriaLabel ? undefined : "tooltip",
        id: hasAriaLabel ? undefined : contentId,
        "data-placement": context.get("currentPlacement"),
        onPointerEnter() {
          send({ type: "content.pointer.move" })
        },
        onPointerLeave() {
          send({ type: "content.pointer.leave" })
        },
        style: {
          pointerEvents: prop("interactive") ? "auto" : "none",
        },
      })
    },
  }
}
