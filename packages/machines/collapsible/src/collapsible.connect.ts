import type { Service } from "@zag-js/core"
import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./collapsible.anatomy"
import * as dom from "./collapsible.dom"
import type { CollapsibleApi, CollapsibleSchema } from "./collapsible.types"

export function connect<T extends PropTypes>(
  service: Service<CollapsibleSchema>,
  normalize: NormalizeProps<T>,
): CollapsibleApi<T> {
  const { state, send, context, scope, prop } = service
  const visible = state.matches("open") || state.matches("closing")
  const open = state.matches("open")

  const { width, height } = context.get("size")
  const disabled = !!prop("disabled")

  const skip = !context.get("initial") && open
  const dir = "ltr"

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
        dir: dir,
        id: dom.getRootId(scope),
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        "data-collapsible": "",
        "data-state": skip ? undefined : open ? "open" : "closed",
        id: dom.getContentId(scope),
        "data-disabled": dataAttr(disabled),
        hidden: !visible,
        style: {
          "--height": height != null ? `${height}px` : undefined,
          "--width": width != null ? `${width}px` : undefined,
        },
      })
    },

    getTriggerProps() {
      return normalize.element({
        ...parts.trigger.attrs,
        id: dom.getTriggerId(scope),
        dir: dir,
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
  }
}
