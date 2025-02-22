import type { Service } from "@zag-js/core"
import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./toast.anatomy"
import * as dom from "./toast.dom"
import type { ToastApi, ToastSchema } from "./toast.types"
import { getGhostAfterStyle, getGhostBeforeStyle, getPlacementStyle } from "./toast.utils"

export function connect<T extends PropTypes, O>(
  service: Service<ToastSchema<O>>,
  normalize: NormalizeProps<T>,
): ToastApi<T, O> {
  const { state, send, prop, scope, context, computed } = service

  const visible = state.hasTag("visible")
  const paused = state.hasTag("paused")

  const mounted = context.get("mounted")
  const frontmost = computed("frontmost")

  const placement = prop("parent").computed("placement")
  const type = prop("type")!
  const stacked = prop("stacked")
  const title = prop("title")!
  const description = prop("description")!
  const action = prop("action")

  const [side, align = "center"] = placement.split("-")

  return {
    type,
    title,
    description,
    placement,
    visible,
    paused,
    closable: !!prop("closable"),
    pause() {
      send({ type: "PAUSE" })
    },

    resume() {
      send({ type: "RESUME" })
    },

    dismiss() {
      send({ type: "DISMISS", src: "programmatic" })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: prop("dir"),
        id: dom.getRootId(scope),
        "data-state": visible ? "open" : "closed",
        "data-type": type,
        "data-placement": placement,
        "data-align": align,
        "data-side": side,
        "data-mounted": dataAttr(mounted),
        "data-paused": dataAttr(paused),

        "data-first": dataAttr(frontmost),
        "data-sibling": dataAttr(!frontmost),
        "data-stack": dataAttr(stacked),
        "data-overlap": dataAttr(!stacked),

        role: "status",
        "aria-atomic": "true",
        "aria-describedby": description ? dom.getDescriptionId(scope) : undefined,
        "aria-labelledby": title ? dom.getTitleId(scope) : undefined,
        tabIndex: 0,
        style: getPlacementStyle(service, visible),
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (event.key == "Escape") {
            send({ type: "DISMISS", src: "keyboard" })
            event.preventDefault()
          }
        },
      })
    },

    /* Leave a ghost div to avoid setting hover to false when transitioning out */
    getGhostBeforeProps() {
      return normalize.element({
        "data-ghost": "before",
        style: getGhostBeforeStyle(service, visible),
      })
    },

    /* Needed to avoid setting hover to false when in between toasts */
    getGhostAfterProps() {
      return normalize.element({
        "data-ghost": "after",
        style: getGhostAfterStyle(),
      })
    },

    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs,
        id: dom.getTitleId(scope),
      })
    },

    getDescriptionProps() {
      return normalize.element({
        ...parts.description.attrs,
        id: dom.getDescriptionId(scope),
      })
    },

    getActionTriggerProps() {
      return normalize.button({
        ...parts.actionTrigger.attrs,
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return
          action?.onClick?.()
          send({ type: "DISMISS", src: "user" })
        },
      })
    },

    getCloseTriggerProps() {
      return normalize.button({
        id: dom.getCloseTriggerId(scope),
        ...parts.closeTrigger.attrs,
        type: "button",
        "aria-label": "Dismiss notification",
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: "DISMISS", src: "user" })
        },
      })
    },
  }
}
