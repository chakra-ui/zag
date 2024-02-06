import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./collapsible.anatomy"
import { dom } from "./collapsible.dom"
import type { Send, State } from "./collapsible.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isOpen = state.matches("open")

  const height = state.context.height
  const width = state.context.width

  return {
    isOpen,
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      "data-state": isOpen ? "open" : "closed",
      dir: state.context.dir,
      id: dom.getRootId(state.context),
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      "data-state": isOpen ? "open" : "closed",
      id: dom.getContentId(state.context),
      role: "region",
      "aria-expanded": isOpen,
      hidden: !isOpen,
      style: {
        "--height": height != null ? `${height}px` : undefined,
        "--width": width != null ? `${width}px` : undefined,
      },
    }),

    triggerProps: normalize.element({
      ...parts.trigger.attrs,
      id: dom.getTriggerId(state.context),
      dir: state.context.dir,
      type: "button",
      "aria-controls": dom.getContentId(state.context),
      "aria-expanded": isOpen || false,
      onClick() {
        send("TOGGLE")
      },
    }),
  }
}
