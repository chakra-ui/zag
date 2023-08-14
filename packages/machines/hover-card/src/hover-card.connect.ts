import { getPlacementStyles, type PositioningOptions } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./hover-card.anatomy"
import { dom } from "./hover-card.dom"
import type { MachineApi, Send, State } from "./hover-card.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isOpen = state.hasTag("open")

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
      "data-state": isOpen ? "open" : "closed",
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
      "data-state": isOpen ? "open" : "closed",
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
