import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./collapsible.anatomy"
import { dom } from "./collapsible.dom"
import type { MachineApi, Send, State } from "./collapsible.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const visible = state.matches("open", "closing")
  const open = state.matches("open")

  const height = state.context.height
  const width = state.context.width
  const disabled = !!state.context.disabled

  const skipMountAnimation = state.context.isMountAnimationPrevented && open

  return {
    disabled,
    visible,
    open,
    setOpen(open) {
      send(open ? "OPEN" : "CLOSE")
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      "data-state": open ? "open" : "closed",
      dir: state.context.dir,
      id: dom.getRootId(state.context),
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      "data-state": skipMountAnimation ? undefined : open ? "open" : "closed",
      id: dom.getContentId(state.context),
      "data-disabled": dataAttr(disabled),
      hidden: !visible,
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
      "data-state": open ? "open" : "closed",
      "data-disabled": dataAttr(disabled),
      "aria-controls": dom.getContentId(state.context),
      "aria-expanded": visible || false,
      onClick() {
        if (disabled) return
        send({ type: open ? "CLOSE" : "OPEN", src: "trigger.click" })
      },
    }),
  }
}
