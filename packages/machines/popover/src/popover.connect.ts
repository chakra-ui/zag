import { getDismissableLayerAttrs, getDismissableLayerStyle } from "@zag-js/dismissable"
import { ariaAttr, dataAttr, isLeftClick, isSafari } from "@zag-js/dom-query"
import { getPlacementSide, getPlacementStyles, type PlacementSide } from "@zag-js/popper"
import type { NormalizeProps, PropTypes, Required } from "@zag-js/types"
import { mergeWithDefault } from "@zag-js/utils"
import { parts } from "./popover.anatomy"
import * as dom from "./popover.dom"
import { getViewportSizeStyle } from "./popover.style"
import type {
  ContentProps,
  ContentState,
  IntlTranslations,
  PopoverApi,
  PopoverService,
  PositionerState,
  TriggerProps,
  TriggerState,
  ViewportState,
} from "./popover.types"

const defaultTranslations: Required<IntlTranslations> = {
  closeTriggerLabel: "close",
}

export function connect<T extends PropTypes>(service: PopoverService, normalize: NormalizeProps<T>): PopoverApi<T> {
  const { state, context, send, prop, scope } = service
  const layer = context.get("layer")
  const translations = mergeWithDefault(defaultTranslations, prop("translations"))
  const open = state.matches("open")

  const currentPlacement = context.get("currentPlacement")
  const currentPlacementSide = currentPlacement ? getPlacementSide(currentPlacement) : undefined
  const rendered = context.get("renderedElements")
  const triggerValue = context.get("triggerValue")
  const transitioning = context.get("transitioning")
  const instant = context.get("instant")
  const activationDirection = context.get("activationDirection")
  const viewportRendered = rendered.viewport

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
    return { nested: !!layer?.nested, hasNested: !!layer?.hasNested, transitioning, instant }
  }

  function getContentState(props: ContentProps = {}): ContentState {
    const { value } = props
    return {
      open: value == null ? open : triggerValue === value,
      modal: !!prop("modal"),
      nested: !!layer?.nested,
      hasNested: !!layer?.hasNested,
      placement: currentPlacement,
      side: currentPlacementSide,
      activationDirection,
      instant,
    }
  }

  function getViewportState(): ViewportState {
    return { open, instant, side: currentPlacementSide, activationDirection, transitioning }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    open: open,
    setOpen(nextOpen, reason = "script") {
      send({ type: nextOpen ? "OPEN" : "CLOSE", src: reason, replaces: "open" })
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
      send({ type: "TRIGGER_VALUE.SET", value })
    },
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
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

    getAnchorProps() {
      return normalize.element({
        ...parts.anchor.attrs(scope.id),
        dir: prop("dir"),
      })
    },

    getTriggerState,
    getTriggerProps(props: TriggerProps = {}) {
      const { value } = props
      const triggerState = getTriggerState(props)
      const { current } = triggerState

      return normalize.button({
        ...parts.trigger.attrs(scope.id),
        dir: prop("dir"),
        type: "button",
        "data-placement": currentPlacement,
        "data-side": currentPlacementSide,
        "data-value": value,
        "data-current": dataAttr(current),
        "aria-haspopup": "dialog",
        "aria-expanded": triggerState.open,
        "data-state": open ? "open" : "closed",
        "aria-controls": dom.getContentId(scope, viewportRendered ? value : null),
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          if (isSafari()) {
            event.currentTarget.focus()
          }
        },
        onClick(event) {
          if (event.defaultPrevented) return
          const shouldSwitch = open && value != null && !current
          const instant = event.detail === 0 ? "click" : null
          send({ type: shouldSwitch ? "TRIGGER_VALUE.SET" : "TOGGLE", value, instant, src: "trigger-click" })
        },
        onBlur(event) {
          send({ type: "TRIGGER_BLUR", target: event.relatedTarget })
        },
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs(scope.id),
        dir: prop("dir"),
        "data-state": open ? "open" : "closed",
      })
    },

    getPositionerState,
    getPositionerProps() {
      const positionerState = getPositionerState()
      return normalize.element({
        ...parts.positioner.attrs(scope.id),
        dir: prop("dir"),
        "data-transitioning": dataAttr(positionerState.transitioning),
        "data-instant": positionerState.instant ?? undefined,
        ...getDismissableLayerAttrs(layer),
        style: {
          ...popperStyles.floating,
          ...getDismissableLayerStyle(layer),
          ...getViewportSizeStyle(viewportRendered ? context.get("viewportSize") : null),
        },
      })
    },

    getContentState,
    getContentProps(props = {}) {
      const { value } = props
      const contentState = getContentState(props)
      const contentLayer = viewportRendered ? null : layer
      return normalize.element({
        ...parts.content.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getContentId(scope, value),
        tabIndex: -1,
        role: "dialog",
        "aria-modal": ariaAttr(contentState.modal),
        hidden: !contentState.open,
        "data-value": value,
        "data-state": contentState.open ? "open" : "closed",
        "data-expanded": dataAttr(contentState.open),
        "aria-labelledby": rendered.title ? dom.getTitleId(scope, value) : undefined,
        "aria-describedby": rendered.description ? dom.getDescriptionId(scope, value) : undefined,
        "data-placement": contentState.placement,
        "data-side": contentState.side,
        "data-activation-direction": contentState.activationDirection ?? undefined,
        "data-instant": contentState.instant ?? undefined,
        ...getDismissableLayerAttrs(contentLayer),
        style: getDismissableLayerStyle(contentLayer, { pointerEvents: true }),
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
        "data-side": viewportState.side,
        "data-instant": viewportState.instant ?? undefined,
        "data-activation-direction": viewportState.activationDirection ?? undefined,
        "data-transitioning": dataAttr(viewportState.transitioning),
        ...getDismissableLayerAttrs(layer),
        style: {
          ...getDismissableLayerStyle(layer, { pointerEvents: true }),
          ...getViewportStyle(viewportState.side),
        },
      })
    },

    getTitleProps(props = {}) {
      return normalize.element({
        ...parts.title.attrs(scope.id),
        id: dom.getTitleId(scope, props.value),
        dir: prop("dir"),
      })
    },

    getDescriptionProps(props = {}) {
      return normalize.element({
        ...parts.description.attrs(scope.id),
        id: dom.getDescriptionId(scope, props.value),
        dir: prop("dir"),
      })
    },

    getCloseTriggerProps() {
      return normalize.button({
        ...parts.closeTrigger.attrs(scope.id),
        dir: prop("dir"),
        type: "button",
        "aria-label": translations.closeTriggerLabel,
        onClick(event) {
          if (event.defaultPrevented) return
          event.stopPropagation()
          send({ type: "CLOSE", src: "close-trigger" })
        },
      })
    },
  }
}

function getViewportStyle(side: PlacementSide | undefined) {
  return {
    position: "absolute",
    width: "var(--viewport-width)",
    height: "var(--viewport-height)",
    top: side === "top" ? undefined : "0px",
    bottom: side === "top" ? "0px" : undefined,
    left: side === "left" ? undefined : "0px",
    right: side === "left" ? "0px" : undefined,
  } as const
}
