import { getDismissableLayerAttrs, getDismissableLayerStyle } from "@zag-js/dismissable"
import { dataAttr, getEventTarget } from "@zag-js/dom-query"
import { isFocusRestoredByWindow, isFocusVisible } from "@zag-js/focus-visible"
import { getInlineRectCoords, getLineRects, getPlacementSide, getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./hover-card.anatomy"
import * as dom from "./hover-card.dom"
import { getViewportSizeStyle, getViewportStyle } from "./hover-card.style"
import type {
  ContentProps,
  ContentState,
  HoverCardApi,
  HoverCardService,
  PositionerState,
  TriggerProps,
  TriggerState,
  ViewportState,
} from "./hover-card.types"

export function connect<T extends PropTypes>(service: HoverCardService, normalize: NormalizeProps<T>): HoverCardApi<T> {
  const { state, send, prop, context, refs, scope } = service
  const layer = context.get("layer")

  const open = state.hasTag("open")
  const triggerValue = context.get("triggerValue")
  const activationDirection = context.get("activationDirection")
  const transitioning = context.get("transitioning")
  const viewportRendered = context.get("viewportRendered")
  const currentPlacement = context.get("currentPlacement")
  const currentPlacementSide = currentPlacement ? getPlacementSide(currentPlacement) : undefined

  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: currentPlacement,
  })

  // Frozen once open, and measured once per hover so the moves in between cost no layout.
  const captureInlineCoords = (event: { currentTarget: unknown; clientX: number; clientY: number }) => {
    if (open) return
    const element = event.currentTarget as Element
    const cached = refs.get("inlineLines")
    const lines = cached?.element === element ? cached.lines : getLineRects(element.getClientRects()).lines
    refs.set("inlineLines", { element, lines })
    refs.set("inlineCoords", getInlineRectCoords({ element, x: event.clientX, y: event.clientY, lines }))
  }

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getTriggerState(props: TriggerProps = {}): TriggerState {
    const { value } = props
    const current = value == null ? false : triggerValue === value
    return { value, current, open: value == null ? open : open && current }
  }

  function getPositionerState(): PositionerState {
    return { nested: !!layer?.nested, hasNested: !!layer?.hasNested, transitioning, instant: context.get("instant") }
  }

  function getContentState(props: ContentProps = {}): ContentState {
    const { value } = props
    return {
      open: value == null ? open : triggerValue === value,
      nested: !!layer?.nested,
      hasNested: !!layer?.hasNested,
      placement: currentPlacement,
      side: currentPlacementSide,
      instant: context.get("instant"),
      activationDirection,
    }
  }

  function getViewportState(): ViewportState {
    return { open, instant: context.get("instant"), side: currentPlacementSide, activationDirection, transitioning }
  }

  const popupHandlers = {
    onPointerEnter(event: { pointerType: string }) {
      if (event.pointerType === "touch") return
      if (prop("disabled")) return
      send({ type: "CONTENT.POINTER_ENTER" })
    },
    onPointerDown(event: Parameters<typeof getEventTarget>[0]) {
      if (getEventTarget<Element>(event)?.closest("[aria-haspopup]")) send({ type: "CONTENT.INTERACT" })
    },
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    open: open,
    setOpen(nextOpen, reason = "script") {
      if (prop("disabled")) return
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
          captureInlineCoords(event)
          const shouldSwitch = open && value != null && !current
          send({
            type: shouldSwitch ? "TRIGGER_VALUE.SET" : "POINTER_ENTER",
            src: "trigger-hover",
            value,
          })
        },
        onPointerMove(event) {
          if (event.pointerType === "touch") return
          if (prop("disabled")) return
          captureInlineCoords(event)
        },
        onPointerLeave(event) {
          if (event.pointerType === "touch") return
          if (prop("disabled")) return
          refs.set("inlineLines", undefined)
          send({ type: "POINTER_LEAVE", src: "pointer-leave" })
        },
        onFocus() {
          if (prop("disabled")) return
          // Only keyboard/virtual focus opens. Focus arriving after a pointer interaction, such as
          // a dialog restoring it, carries no intent to preview.
          if (!isFocusVisible() || isFocusRestoredByWindow()) return
          // Focus has no line to prefer.
          refs.set("inlineCoords", undefined)
          const shouldSwitch = open && value != null && !current
          send({
            type: shouldSwitch ? "TRIGGER_VALUE.SET" : "TRIGGER_FOCUS",
            src: "trigger-focus",
            value,
          })
        },
        onBlur() {
          if (prop("disabled")) return
          send({ type: "TRIGGER_BLUR", src: "trigger-blur" })
        },
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

    getViewportState,
    getViewportProps() {
      const viewportState = getViewportState()
      return normalize.element({
        ...parts.viewport.attrs(scope.id),
        dir: prop("dir"),
        hidden: !viewportState.open,
        "data-state": viewportState.open ? "open" : "closed",
        "data-instant": viewportState.instant ?? undefined,
        "data-side": viewportState.side,
        "data-activation-direction": viewportState.activationDirection ?? undefined,
        "data-transitioning": dataAttr(viewportState.transitioning),
        ...getDismissableLayerAttrs(layer),
        style: {
          ...getDismissableLayerStyle(layer, { pointerEvents: true }),
          ...getViewportStyle(viewportState.side),
        },
        ...popupHandlers,
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
        hidden: !contentState.open,
        tabIndex: -1,
        "data-value": value,
        "data-state": contentState.open ? "open" : "closed",
        "data-placement": contentState.placement,
        "data-side": contentState.side,
        "data-instant": contentState.instant ?? undefined,
        "data-activation-direction": contentState.activationDirection ?? undefined,
        ...getDismissableLayerAttrs(contentLayer),
        style: getDismissableLayerStyle(contentLayer, { pointerEvents: true }),
        ...(viewportRendered ? {} : popupHandlers),
      })
    },
  }
}
