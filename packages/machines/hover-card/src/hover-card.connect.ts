import { getDismissableLayerAttrs, getDismissableLayerStyle } from "@zag-js/dismissable"
import { dataAttr } from "@zag-js/dom-query"
import { getPlacementSide, getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./hover-card.anatomy"
import * as dom from "./hover-card.dom"
import type {
  ContentState,
  HoverCardApi,
  HoverCardService,
  PositionerState,
  TriggerProps,
  TriggerState,
} from "./hover-card.types"

export function connect<T extends PropTypes>(service: HoverCardService, normalize: NormalizeProps<T>): HoverCardApi<T> {
  const { state, send, prop, context, scope } = service
  const layer = context.get("layer")

  const open = state.hasTag("open")
  const triggerValue = context.get("triggerValue")
  const currentPlacement = context.get("currentPlacement")
  const currentPlacementSide = currentPlacement ? getPlacementSide(currentPlacement) : undefined

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

  function getPositionerState(): PositionerState {
    return { nested: !!layer?.nested, hasNested: !!layer?.hasNested }
  }

  function getContentState(): ContentState {
    return {
      open,
      nested: !!layer?.nested,
      hasNested: !!layer?.hasNested,
      placement: currentPlacement,
      side: currentPlacementSide,
    }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

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

    getTriggerState,
    getTriggerProps(props: TriggerProps = {}) {
      const { value } = props
      const triggerState = getTriggerState(props)
      const { current } = triggerState

      return normalize.element({
        ...parts.trigger.attrs(scope.id),
        dir: prop("dir"),
        "data-placement": currentPlacement,
        "data-side": currentPlacementSide,
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

    getPositionerState,
    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs(scope.id),
        dir: prop("dir"),
        ...getDismissableLayerAttrs(layer),
        style: {
          ...popperStyles.floating,
          ...getDismissableLayerStyle(layer, { zIndex: true }),
        },
      })
    },

    getContentState,
    getContentProps() {
      const contentState = getContentState()
      return normalize.element({
        ...parts.content.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getContentId(scope),
        hidden: !contentState.open,
        tabIndex: -1,
        "data-state": contentState.open ? "open" : "closed",
        "data-placement": contentState.placement,
        "data-side": contentState.side,
        ...getDismissableLayerAttrs(layer),
        style: getDismissableLayerStyle(layer, { pointerEvents: true }),
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
