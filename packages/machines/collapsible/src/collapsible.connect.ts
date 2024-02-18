import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./collapsible.anatomy"
import { dom } from "./collapsible.dom"
import type { MachineApi, Send, State } from "./collapsible.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isVisible = state.matches("open", "closing")
  const isOpen = state.matches("open")

  const height = state.context.height
  const width = state.context.width
  const disabled = state.context.disabled

  const skipDataAttr = state.context.isMountAnimationPrevented && isOpen

  return {
    isDisabled: !!disabled,
    isOpen,
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      "data-state": isVisible ? "open" : "closed",
      dir: state.context.dir,
      id: dom.getRootId(state.context),
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      "data-state": skipDataAttr ? undefined : isOpen ? "open" : "closed",
      id: dom.getContentId(state.context),
      "data-disabled": dataAttr(disabled),
      hidden: !isVisible,
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
      "data-disabled": dataAttr(disabled),
      "aria-controls": dom.getContentId(state.context),
      "aria-expanded": isVisible || false,
      onClick() {
        if (disabled) return
        send({ type: isOpen ? "CLOSE" : "OPEN", src: "trigger.click" })
      },
    }),
  }
}
