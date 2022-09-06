import { dataAttr } from "@zag-js/dom-utils"
import { getPlacementStyles } from "@zag-js/popper"
import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { State, Send } from "./hover-card.types"
import { dom } from "./hover-card.dom"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isOpen = state.hasTag("open")

  const popperStyles = getPlacementStyles({
    measured: !!state.context.isPlacementComplete,
    placement: state.context.currentPlacement,
  })

  return {
    isOpen,

    arrowProps: normalize.element({
      id: dom.getArrowId(state.context),
      "data-part": "arrow",
      style: popperStyles.arrow,
    }),

    innerArrowProps: normalize.element({
      "data-part": "arrow-inner",
      style: popperStyles.innerArrow,
    }),

    triggerProps: normalize.element({
      "data-part": "trigger",
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
      "data-part": "positioner",
      style: popperStyles.floating,
    }),

    contentProps: normalize.element({
      "data-part": "content",
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
