import { dataAttr, visuallyHiddenStyle } from "@zag-js/dom-utils"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./tooltip.dom"
import { store } from "./tooltip.store"
import type { Send, State } from "./tooltip.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const id = state.context.id
  const hasAriaLabel = state.context.hasAriaLabel

  const isOpen = state.hasTag("open")

  const triggerId = dom.getTriggerId(state.context)
  const contentId = dom.getContentId(state.context)

  const isDisabled = state.context.disabled

  const popperStyles = getPlacementStyles({
    measured: !!state.context.isPlacementComplete,
    placement: state.context.currentPlacement,
  })

  return {
    isOpen,
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },
    getAnimationState() {
      return {
        enter: store.prevId === null && id === store.id,
        exit: store.id === null,
      }
    },

    triggerProps: normalize.button({
      "data-part": "trigger",
      id: triggerId,
      "data-expanded": dataAttr(isOpen),
      "aria-describedby": isOpen ? contentId : undefined,
      onClick() {
        send("CLICK")
      },
      onFocus() {
        send("FOCUS")
      },
      onBlur() {
        if (id === store.id) {
          send("BLUR")
        }
      },
      onPointerDown() {
        if (isDisabled) return
        if (id === store.id) {
          send("POINTER_DOWN")
        }
      },
      onPointerMove() {
        if (isDisabled) return
        send("POINTER_ENTER")
      },
      onPointerLeave() {
        if (isDisabled) return
        send("POINTER_LEAVE")
      },
      onPointerCancel() {
        if (isDisabled) return
        send("POINTER_LEAVE")
      },
    }),

    arrowProps: normalize.element({
      id: dom.getArrowId(state.context),
      "data-part": "arrow",
      style: popperStyles.arrow,
    }),

    innerArrowProps: normalize.element({
      "data-part": "arrow-inner",
      style: popperStyles.innerArrow,
    }),

    positionerProps: normalize.element({
      id: dom.getPositionerId(state.context),
      "data-part": "positioner",
      style: popperStyles.floating,
    }),

    contentProps: normalize.element({
      "data-part": "content",
      role: hasAriaLabel ? undefined : "tooltip",
      id: hasAriaLabel ? undefined : contentId,
      "data-placement": state.context.currentPlacement,
      onPointerEnter() {
        send("TOOLTIP_POINTER_ENTER")
      },
      onPointerLeave() {
        send("TOOLTIP_POINTER_LEAVE")
      },
      style: {
        pointerEvents: state.context.interactive ? "auto" : "none",
      },
    }),

    labelProps: normalize.element({
      "data-part": "label",
      id: contentId,
      role: "tooltip",
      style: visuallyHiddenStyle,
      children: state.context["aria-label"],
    }),

    createPortal() {
      const doc = dom.getDoc(state.context)
      const exist = dom.getPortalEl(state.context)
      if (exist) return exist
      const portal = dom.createPortalEl(state.context)
      doc.body.appendChild(portal)
      return portal
    },
  }
}
