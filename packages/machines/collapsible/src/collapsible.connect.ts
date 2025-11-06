import type { Service } from "@zag-js/core"
import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./collapsible.anatomy"
import * as dom from "./collapsible.dom"
import type { CollapsibleApi, CollapsibleSchema } from "./collapsible.types"
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

  const skip = !context.get("initial") && open

  return {
    disabled,
    visible,
    open,
    measureSize() {
      send({ type: "size.measure" })
    },
    setOpen(nextOpen) {
      const open = state.matches("open")
      if (open === nextOpen) return
      send({ type: nextOpen ? "open" : "close" })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        "data-state": open ? "open" : "closed",
        dir: prop("dir"),
        id: dom.getRootId(scope),
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(scope),
        "data-collapsible": "",
        "data-state": skip ? undefined : open ? "open" : "closed",
        "data-disabled": dataAttr(disabled),
        "data-has-collapsed-size": dataAttr(hasCollapsedSize),
        hidden: !visible && !hasCollapsedSize,
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
      return normalize.element({
        ...parts.trigger.attrs,
        id: dom.getTriggerId(scope),
        dir: prop("dir"),
        type: "button",
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(disabled),
        "aria-controls": dom.getContentId(scope),
        "aria-expanded": visible || false,
        onClick(event) {
          if (event.defaultPrevented) return
          if (disabled) return
          send({ type: open ? "close" : "open" })
        },
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        dir: prop("dir"),
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(disabled),
      })
    },
  }
}
