import type { Service } from "@zag-js/core"
import { dataAttr, isLeftClick } from "@zag-js/dom-query"
import { isFocusRestoredByWindow, isFocusVisible } from "@zag-js/focus-visible"
import { getPlacementSide, getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tooltip.anatomy"
import * as dom from "./tooltip.dom"
import { store } from "./tooltip.store"
import { getViewportSizeStyle, getViewportStyle } from "./tooltip.style"
import type {
  ContentProps,
  ContentState,
  TooltipApi,
  TooltipSchema,
  TriggerProps,
  TriggerState,
  ViewportState,
} from "./tooltip.types"

export function connect<P extends PropTypes>(
  service: Service<TooltipSchema>,
  normalize: NormalizeProps<P>,
): TooltipApi<P> {
  const { state, context, send, scope, prop, event: _event } = service
  const id = prop("id")

  const open = state.matches("open", "closing")
  const triggerValue = context.get("triggerValue")
  const currentPlacement = context.get("currentPlacement")
  const currentPlacementSide = currentPlacement ? getPlacementSide(currentPlacement) : undefined

  const activationDirection = context.get("activationDirection")
  const transitioning = context.get("transitioning")
  const viewportRendered = context.get("viewportRendered")

  const disabled = prop("disabled")

  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: currentPlacement,
  })

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getTriggerState(props: TriggerProps = {}): TriggerState {
    const { value } = props
    const current = value == null ? false : triggerValue === value
    return { value, current, open: value == null ? open : open && current }
  }

  const isCurrentTooltip = store.get("id") === id
  const isPrevTooltip = store.get("prevId") === id
  const instant = !!store.get("instant") && ((open && isCurrentTooltip) || isPrevTooltip)

  function getContentState(props: ContentProps = {}): ContentState {
    const { value } = props
    return {
      open: value == null ? open : triggerValue === value,
      instant,
      placement: currentPlacement,
      side: currentPlacementSide,
      activationDirection,
    }
  }

  function getViewportState(): ViewportState {
    return { open, instant, side: currentPlacementSide, activationDirection, transitioning }
  }

  const popupPointerProps = {
    onPointerEnter() {
      send({ type: "CONTENT_POINTER_MOVE" })
    },
    style: {
      pointerEvents: prop("interactive") ? "auto" : "none",
    },
  } as const

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    open: open,
    setOpen(nextOpen) {
      send({ type: nextOpen ? "OPEN" : "CLOSE", replaces: "open" })
    },

    triggerValue,
    activationDirection,
    getContentValues() {
      const previousValue = context.get("previousTriggerValue")
      const values: string[] = []
      if (previousValue != null && previousValue !== triggerValue) values.push(previousValue)
      if (triggerValue != null) values.push(triggerValue)
      return values
    },
    setTriggerValue(value) {
      send({ type: "TRIGGER_VALUE.SET", value: value ?? undefined })
    },

    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },

    getTriggerState,
    getTriggerProps(props: TriggerProps = {}) {
      const { value } = props
      const { current } = getTriggerState(props)
      const triggerId = dom.getTriggerId(scope, value)

      return normalize.button({
        ...parts.trigger.attrs(scope.id),
        id: triggerId,
        "data-value": value,
        "data-current": dataAttr(current),
        dir: prop("dir"),
        "data-expanded": dataAttr(open),
        "data-state": open ? "open" : "closed",
        "aria-describedby": open ? dom.getContentId(scope, viewportRendered ? value : null) : undefined,
        onClick(event) {
          if (event.defaultPrevented) return
          if (disabled) return
          if (!prop("closeOnClick")) return
          const shouldSwitch = open && value != null && !current
          send({ type: shouldSwitch ? "TRIGGER_VALUE.SET" : "CLOSE", src: "trigger.click", value, triggerId })
        },
        onFocus(event) {
          if (event.defaultPrevented) return
          if (disabled) return
          if (!isFocusVisible() || isFocusRestoredByWindow()) return
          const shouldSwitch = open && value != null && !current
          send({ type: shouldSwitch ? "TRIGGER_VALUE.SET" : "OPEN", src: "trigger.focus", value, triggerId })
        },
        onBlur(event) {
          if (event.defaultPrevented) return
          if (disabled) return
          if (id !== store.get("id")) return
          // Check if focus moved to another trigger in the same tooltip.
          // If so, don't close - the focus handler will handle the switch.
          const activeEl = event.relatedTarget ?? scope.getDoc().activeElement
          const focusedAnotherTrigger = activeEl?.closest(`[${parts.trigger.attr}="${scope.id}"]`) != null
          if (!focusedAnotherTrigger) {
            send({ type: "CLOSE", src: "trigger.blur", value, triggerId })
          }
        },
        onPointerDown(event) {
          if (event.defaultPrevented) return
          if (disabled) return
          if (!isLeftClick(event)) return
          if (!prop("closeOnPointerDown")) return
          send({ type: "CLOSE", src: "trigger.pointerdown", value, triggerId })
        },
        onPointerMove(event) {
          if (event.defaultPrevented) return
          if (disabled) return
          if (event.pointerType === "touch") return
          const shouldSwitch = open && value != null && !current
          send({ type: shouldSwitch ? "TRIGGER_VALUE.SET" : "POINTER_MOVE", value, triggerId })
        },
        onPointerOver(event) {
          if (event.defaultPrevented) return
          if (disabled) return
          if (event.pointerType === "touch") return
          send({ type: "POINTER_MOVE", value, triggerId })
        },
        onPointerLeave() {
          send({ type: "POINTER_LEAVE" })
        },
        onPointerCancel() {
          send({ type: "POINTER_LEAVE" })
        },
      })
    },

    getArrowProps() {
      return normalize.element({
        ...parts.arrow.attrs(scope.id),
        dir: prop("dir"),
        hidden: viewportRendered ? !open : undefined,
        "data-state": open ? "open" : "closed",
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

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs(scope.id),
        dir: prop("dir"),
        "data-transitioning": dataAttr(transitioning),
        style: {
          ...popperStyles.floating,
          ...getViewportSizeStyle(viewportRendered ? context.get("viewportSize") : null),
        },
      })
    },

    getViewportState,
    getViewportProps() {
      const viewportState = getViewportState()
      return normalize.element({
        ...parts.viewport.attrs(scope.id),
        dir: prop("dir"),
        hidden: !viewportState.open,
        "data-state": viewportState.open ? "open" : "closed",
        "data-instant": dataAttr(viewportState.instant),
        "data-side": viewportState.side,
        "data-activation-direction": viewportState.activationDirection ?? undefined,
        "data-transitioning": dataAttr(viewportState.transitioning),
        onPointerEnter: popupPointerProps.onPointerEnter,
        style: {
          ...popupPointerProps.style,
          ...getViewportStyle(viewportState.side),
        },
      })
    },

    getContentState,
    getContentProps(props = {}) {
      const { value } = props
      const contentState = getContentState(props)

      return normalize.element({
        ...parts.content.attrs(scope.id),
        dir: prop("dir"),
        hidden: !contentState.open,
        "data-value": value,
        "data-state": contentState.open ? "open" : "closed",
        "data-instant": dataAttr(contentState.instant),
        role: "tooltip",
        id: dom.getContentId(scope, value),
        "aria-label": prop("aria-label"),
        "data-placement": contentState.placement,
        "data-side": contentState.side,
        "data-activation-direction": contentState.activationDirection ?? undefined,
        ...(viewportRendered ? { style: popupPointerProps.style } : popupPointerProps),
      })
    },
  }
}
