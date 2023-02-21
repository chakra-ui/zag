import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tooltip.anatomy"
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
      ...parts.trigger.attrs,
      id: triggerId,
      "data-expanded": isOpen || undefined,
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
      ...parts.arrow.attrs,
      style: popperStyles.arrow,
    }),

    arrowTipProps: normalize.element({
      ...parts.arrowTip.attrs,
      style: popperStyles.arrowTip,
    }),

    positionerProps: normalize.element({
      id: dom.getPositionerId(state.context),
      ...parts.positioner.attrs,
      style: popperStyles.floating,
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      hidden: !isOpen,
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
      ...parts.label.attrs,
      id: contentId,
      role: "tooltip",
      style: visuallyHiddenStyle,
      children: state.context["aria-label"],
    }),
  }
}
