import type { Service } from "@zag-js/core"
import { dataAttr, getEventTarget } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes, Required } from "@zag-js/types"
import { mergeWithDefault } from "@zag-js/utils"
import { parts } from "./toast.anatomy"
import * as dom from "./toast.dom"
import type { IntlTranslations, RootState, ToastApi, ToastSchema } from "./toast.types"
import { getGhostAfterStyle, getGhostBeforeStyle, getPlacementStyle } from "./toast.utils"

const defaultTranslations: Required<IntlTranslations> = {
  closeTriggerLabel: "Dismiss notification",
}

// Presses that start on controls never begin a swipe, so their clicks still work
const SWIPE_IGNORE_SELECTOR = 'button,a,input,textarea,select,[role="button"],[data-swipe-ignore]'

export function connect<T extends PropTypes, O>(
  service: Service<ToastSchema<O>>,
  normalize: NormalizeProps<T>,
): ToastApi<T, O> {
  const { state, send, prop, scope, context, computed } = service
  const translations = mergeWithDefault(defaultTranslations, prop("translations"))

  const visible = state.hasTag("visible")
  const paused = state.hasTag("paused")

  const mounted = context.get("mounted")
  const rendered = context.get("rendered")
  const frontmost = computed("frontmost")

  const placement = prop("parent").computed("placement")
  const type = prop("type")
  const stacked = prop("parent").state.matches("stack")
  const title = prop("title")
  const description = prop("description")
  const action = prop("action")

  const [side, align = "center"] = placement.split("-")

  const swiping = state.matches("visible:swiping")
  const swipeDirection = context.get("swipeDirection")

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getRootState(): RootState {
    return {
      visible,
      paused,
      mounted,
      frontmost,
      stacked: !!stacked,
      type,
      placement,
      side,
      align,
      swiping,
      swipeDirection,
    }
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
      prop("parent").prop("store").pause(prop("id"))
    },

    resume() {
      prop("parent").prop("store").resume(prop("id"))
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
        "data-swiping": dataAttr(rootState.swiping),
        "data-swipe-direction": rootState.swipeDirection ?? undefined,

        role: "status",
        "aria-atomic": "true",
        "aria-describedby": description && rendered.description ? dom.getDescriptionId(scope) : undefined,
        "aria-labelledby": title && rendered.title ? dom.getTitleId(scope) : undefined,
        tabIndex: 0,
        style: getPlacementStyle(service, visible),
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (event.key == "Escape") {
            send({ type: "DISMISS", src: "keyboard" })
            event.preventDefault()
          }
        },
        onPointerDown(event) {
          if (event.defaultPrevented || event.button !== 0) return
          const target = getEventTarget<Element>(event)
          if (target?.closest(SWIPE_IGNORE_SELECTOR)) return
          send({ type: "SWIPE.START", point: { x: event.clientX, y: event.clientY }, pointerId: event.pointerId })
        },
      })
    },

    getContentProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.content.attrs(scope.id),
        "data-state": rootState.visible ? "open" : "closed",
        "data-first": dataAttr(rootState.frontmost),
        "data-sibling": dataAttr(!rootState.frontmost),
        "data-stack": dataAttr(rootState.stacked),
        "data-overlap": dataAttr(!rootState.stacked),
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
