import type { Service } from "@zag-js/core"
import { getDismissableLayerAttrs, getDismissableLayerStyle } from "@zag-js/dismissable"
import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./dialog.anatomy"
import * as dom from "./dialog.dom"
import type {
  BackdropState,
  ContentState,
  DialogApi,
  DialogSchema,
  PositionerState,
  TriggerProps,
  TriggerState,
} from "./dialog.types"

export function connect<T extends PropTypes>(
  service: Service<DialogSchema>,
  normalize: NormalizeProps<T>,
): DialogApi<T> {
  const { state, send, context, prop, scope } = service
  const ariaLabel = prop("aria-label")
  const open = state.matches("open")
  const triggerValue = context.get("triggerValue")
  const layer = context.get("layer")

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getTriggerState(props: TriggerProps = {}): TriggerState {
    const { value } = props
    const current = value == null ? false : triggerValue === value
    return { value, current, open: value == null ? open : open && current }
  }

  function getBackdropState(): BackdropState {
    return { open, nested: !!layer?.nested, hasNested: !!layer?.hasNested }
  }

  function getPositionerState(): PositionerState {
    return { nested: !!layer?.nested, hasNested: !!layer?.hasNested }
  }

  function getContentState(): ContentState {
    return { open, modal: prop("modal"), nested: !!layer?.nested, hasNested: !!layer?.hasNested }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    open,
    setOpen(nextOpen) {
      const open = state.matches("open")
      if (open === nextOpen) return
      send({ type: nextOpen ? "OPEN" : "CLOSE" })
    },

    triggerValue,
    setTriggerValue(value) {
      send({ type: "TRIGGER_VALUE.SET", value })
    },

    getTriggerState,
    getTriggerProps(props = {}) {
      const { value } = props
      const triggerState = getTriggerState(props)
      const { current } = triggerState
      return normalize.button({
        ...parts.trigger.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getTriggerId(scope, value),
        "data-value": value,
        "aria-haspopup": "dialog",
        type: "button",
        "aria-expanded": triggerState.open,
        "data-state": open ? "open" : "closed",
        "aria-controls": dom.getContentId(scope),
        "data-current": dataAttr(current),
        onClick(event) {
          if (event.defaultPrevented) return
          const shouldSwitch = open && value != null && !current
          send({ type: shouldSwitch ? "TRIGGER_VALUE.SET" : "TOGGLE", value })
        },
      })
    },

    getBackdropState,
    getBackdropProps() {
      const backdropState = getBackdropState()
      return normalize.element({
        ...parts.backdrop.attrs(scope.id),
        dir: prop("dir"),
        hidden: !backdropState.open,
        "data-state": backdropState.open ? "open" : "closed",
        ...getDismissableLayerAttrs(layer),
        style: getDismissableLayerStyle(layer, { zIndex: true }),
      })
    },

    getPositionerState,
    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs(scope.id),
        dir: prop("dir"),
        ...getDismissableLayerAttrs(layer),
        style: {
          ...getDismissableLayerStyle(layer, { zIndex: true }),
          pointerEvents: !open || !prop("modal") ? "none" : undefined,
        },
      })
    },

    getContentState,
    getContentProps() {
      const rendered = context.get("rendered")
      const contentState = getContentState()
      return normalize.element({
        ...parts.content.attrs(scope.id),
        dir: prop("dir"),
        role: prop("role"),
        hidden: !contentState.open,
        id: dom.getContentId(scope),
        tabIndex: -1,
        "data-state": contentState.open ? "open" : "closed",
        "aria-modal": contentState.modal,
        "aria-label": ariaLabel || undefined,
        "aria-labelledby": ariaLabel || !rendered.title ? undefined : dom.getTitleId(scope),
        "aria-describedby": rendered.description ? dom.getDescriptionId(scope) : undefined,
        ...getDismissableLayerAttrs(layer),
        style: getDismissableLayerStyle(layer, { pointerEvents: true }),
      })
    },

    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getTitleId(scope),
      })
    },

    getDescriptionProps() {
      return normalize.element({
        ...parts.description.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getDescriptionId(scope),
      })
    },

    getCloseTriggerProps() {
      return normalize.button({
        ...parts.closeTrigger.attrs(scope.id),
        dir: prop("dir"),
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
