import { dataAttr } from "@zag-js/dom-query"
import { getPlacementStyles, PositioningOptions } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./hover-card.anatomy"
import { dom } from "./hover-card.dom"
import type { Send, State } from "./hover-card.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isOpen = state.hasTag("open")

  const popperStyles = getPlacementStyles({
    placement: state.context.currentPlacement,
  })

  return {
    /**
     * Whether the hover card is open
     */
    isOpen,
    /**
     * Function to open the hover card
     */
    open() {
      send("OPEN")
    },
    /**
     * Function to close the hover card
     */
    close() {
      send("CLOSE")
    },
    /**
     * Function to reposition the popover
     */
    setPositioning(options: Partial<PositioningOptions>) {
      send({ type: "SET_POSITIONING", options })
    },

    arrowProps: normalize.element({
      id: dom.getArrowId(state.context),
      ...parts.arrow.attrs,
      style: popperStyles.arrow,
    }),

    arrowTipProps: normalize.element({
      ...parts.arrowTip.attrs,
      style: popperStyles.arrowTip,
    }),

    triggerProps: normalize.element({
      ...parts.trigger.attrs,
      "data-placement": state.context.currentPlacement,
      id: dom.getTriggerId(state.context),
      "data-expanded": dataAttr(isOpen),
      onPointerEnter(event) {
        if (event.pointerType === "touch") return
        send({ type: "POINTER_ENTER", src: "trigger" })
      },
      onPointerLeave(event) {
        if (event.pointerType === "touch") return
        send({ type: "POINTER_LEAVE", src: "trigger" })
      },
      onFocus() {
        send("TRIGGER_FOCUS")
      },
      onBlur() {
        send("TRIGGER_BLUR")
      },
      onTouchStart(event) {
        event.preventDefault()
      },
    }),

    positionerProps: normalize.element({
      id: dom.getPositionerId(state.context),
      ...parts.positioner.attrs,
      style: popperStyles.floating,
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      id: dom.getContentId(state.context),
      hidden: !isOpen,
      "data-expanded": dataAttr(isOpen),
      "data-placement": state.context.currentPlacement,
      onPointerEnter(event) {
        if (event.pointerType === "touch") return
        send({ type: "POINTER_ENTER", src: "content" })
      },
      onPointerLeave(event) {
        if (event.pointerType === "touch") return
        send({ type: "POINTER_LEAVE", src: "content" })
      },
    }),
  }
}
