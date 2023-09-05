import { dataAttr } from "@zag-js/dom-query"
import { getPlacementStyles, type PositioningOptions } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tooltip.anatomy"
import { dom } from "./tooltip.dom"
import { store } from "./tooltip.store"
import type { MachineApi, Send, State } from "./tooltip.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const id = state.context.id
  const hasAriaLabel = state.context.hasAriaLabel

  const isOpen = state.hasTag("open")

  const triggerId = dom.getTriggerId(state.context)
  const contentId = dom.getContentId(state.context)

  const isDisabled = state.context.disabled

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
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
    setPositioning(options: Partial<PositioningOptions> = {}) {
      send({ type: "SET_POSITIONING", options })
    },

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      id: triggerId,
      "data-expanded": dataAttr(isOpen),
      "data-state": isOpen ? "open" : "closed",
      "aria-describedby": isOpen ? contentId : undefined,
      onClick() {
        send("CLICK")
      },
      onFocus() {
        if (state.event.type === "POINTER_DOWN") return
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
      onPointerMove(event) {
        if (isDisabled || event.pointerType === "touch") return
        send("POINTER_MOVE")
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
      "data-state": isOpen ? "open" : "closed",
      role: hasAriaLabel ? undefined : "tooltip",
      id: hasAriaLabel ? undefined : contentId,
      "data-placement": state.context.currentPlacement,
      onPointerEnter() {
        send("CONTENT.POINTER_MOVE")
      },
      onPointerLeave() {
        send("CONTENT.POINTER_LEAVE")
      },
      style: {
        pointerEvents: state.context.interactive ? "auto" : "none",
      },
    }),
  }
}
