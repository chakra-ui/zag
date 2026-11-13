import type { Service } from "@zag-js/core"
import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./collapsible.anatomy"
import * as dom from "./collapsible.dom"
import type { CollapsibleApi, CollapsibleSchema, ContentState, RootState } from "./collapsible.types"
import { toPx } from "@zag-js/utils"

export function connect<T extends PropTypes>(
  service: Service<CollapsibleSchema>,
  normalize: NormalizeProps<T>,
): CollapsibleApi<T> {
  const { state, send, context, scope, prop } = service
  const visible = state.matches("open") || state.matches("closing")
  const open = state.matches("open")
  const closed = state.matches("closed")

  const { width, height } = context.get("size")
  const disabled = !!prop("disabled")

  const collapsedHeight = prop("collapsedHeight")
  const collapsedWidth = prop("collapsedWidth")

  const hasCollapsedHeight = collapsedHeight != null
  const hasCollapsedWidth = collapsedWidth != null
  const hasCollapsedSize = hasCollapsedHeight || hasCollapsedWidth

  const hiddenValue = prop("hiddenUntilFound") ? "until-found" : true

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getRootState(): RootState {
    return { open, visible, disabled }
  }

  function getContentState(): ContentState {
    return { ...getRootState(), hasCollapsedSize, instant: !context.get("initial") && open }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    disabled,
    visible,
    open,
    measureSize() {
      send({ type: "size.measure" })
    },
    setOpen(nextOpen, reason = "script") {
      send({ type: nextOpen ? "open" : "close", src: reason, replaces: "open" })
    },

    getRootState,
    getRootProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.root.attrs(scope.id),
        "data-state": rootState.open ? "open" : "closed",
        "data-disabled": dataAttr(rootState.disabled),
        dir: prop("dir"),
      })
    },

    getContentState,
    getContentProps() {
      const contentState = getContentState()
      return normalize.element({
        ...parts.content.attrs(scope.id),
        id: dom.getContentId(scope),
        "data-collapsible": "",
        "data-state": contentState.instant ? undefined : contentState.open ? "open" : "closed",
        "data-disabled": dataAttr(contentState.disabled),
        "data-has-collapsed-size": dataAttr(contentState.hasCollapsedSize),
        hidden: !contentState.visible && !contentState.hasCollapsedSize ? hiddenValue : false,
        dir: prop("dir"),
        style: {
          "--height": toPx(height),
          "--width": toPx(width),
          "--collapsed-height": toPx(collapsedHeight),
          "--collapsed-width": toPx(collapsedWidth),
          ...(closed &&
            hasCollapsedHeight && {
              overflow: "hidden",
              minHeight: toPx(collapsedHeight),
              maxHeight: toPx(collapsedHeight),
            }),
          ...(closed &&
            hasCollapsedWidth && {
              overflow: "hidden",
              minWidth: toPx(collapsedWidth),
              maxWidth: toPx(collapsedWidth),
            }),
        },
      })
    },

    getTriggerProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.trigger.attrs(scope.id),
        id: dom.getTriggerId(scope),
        dir: prop("dir"),
        type: "button",
        "data-state": rootState.open ? "open" : "closed",
        "data-disabled": dataAttr(rootState.disabled),
        "aria-controls": dom.getContentId(scope),
        "aria-expanded": rootState.visible || false,
        onClick(event) {
          if (event.defaultPrevented) return
          if (rootState.disabled) return
          send({ type: rootState.open ? "close" : "open", src: "trigger-click" })
        },
      })
    },

    getIndicatorProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.indicator.attrs(scope.id),
        dir: prop("dir"),
        "data-state": rootState.open ? "open" : "closed",
        "data-disabled": dataAttr(rootState.disabled),
      })
    },
  }
}
