import type { Service } from "@zag-js/core"
import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./toast.anatomy"
import * as dom from "./toast.dom"
import type { RootState, ToastApi, ToastSchema } from "./toast.types"
import { getGhostAfterStyle, getGhostBeforeStyle, getPlacementStyle } from "./toast.utils"

export function connect<T extends PropTypes, O>(
  service: Service<ToastSchema<O>>,
  normalize: NormalizeProps<T>,
): ToastApi<T, O> {
  const { state, send, prop, scope, context, computed } = service
  const translations = prop("translations")

  const visible = state.hasTag("visible")
  const paused = state.hasTag("paused")

  const mounted = context.get("mounted")
  const frontmost = computed("frontmost")

  const placement = prop("parent").computed("placement")
  const type = prop("type")
  const stacked = prop("stacked")
  const title = prop("title")
  const description = prop("description")
  const action = prop("action")

  const [side, align = "center"] = placement.split("-")

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getRootState(): RootState {
    return { visible, paused, mounted, frontmost, stacked: !!stacked, type, placement, side, align }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

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

    getRootState,
    getRootProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.root.attrs(scope.id),
        dir: prop("dir"),
        "data-state": rootState.visible ? "open" : "closed",
        "data-type": rootState.type,
        "data-placement": rootState.placement,
        "data-align": rootState.align,
        "data-side": rootState.side,
        "data-mounted": dataAttr(rootState.mounted),
        "data-paused": dataAttr(rootState.paused),

        "data-first": dataAttr(rootState.frontmost),
        "data-sibling": dataAttr(!rootState.frontmost),
        "data-stack": dataAttr(rootState.stacked),
        "data-overlap": dataAttr(!rootState.stacked),

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
        ...parts.title.attrs(scope.id),
        id: dom.getTitleId(scope),
      })
    },

    getDescriptionProps() {
      return normalize.element({
        ...parts.description.attrs(scope.id),
        id: dom.getDescriptionId(scope),
      })
    },

    getActionTriggerProps() {
      return normalize.button({
        ...parts.actionTrigger.attrs(scope.id),
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
        ...parts.closeTrigger.attrs(scope.id),
        type: "button",
        "aria-label": translations?.closeTriggerLabel,
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: "DISMISS", src: "user" })
        },
      })
    },
  }
}
