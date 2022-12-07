import { dataAttr } from "@zag-js/dom-utils"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./popover.dom"
import type { Send, State } from "./popover.types"
import { parts } from "./popover.anatomy"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isOpen = state.matches("open")

  const currentPlacement = state.context.currentPlacement
  const portalled = state.context.currentPortalled
  const rendered = state.context.renderedElements

  const popperStyles = getPlacementStyles({
    measured: !!state.context.isPlacementComplete,
    placement: currentPlacement,
  })

  return {
    portalled,
    isOpen,
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },

    arrowProps: normalize.element({
      id: dom.getArrowId(state.context),
      ...parts.arrow.attrs,
      style: popperStyles.arrow,
    }),

    innerArrowProps: normalize.element({
      ...parts.arrowInner.attrs,
      style: popperStyles.innerArrow,
    }),

    anchorProps: normalize.element({
      ...parts.anchor.attrs,
      id: dom.getAnchorId(state.context),
    }),

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      type: "button",
      "data-placement": currentPlacement,
      id: dom.getTriggerId(state.context),
      "aria-haspopup": "dialog",
      "aria-expanded": isOpen,
      "data-expanded": dataAttr(isOpen),
      "aria-controls": dom.getContentId(state.context),
      onClick() {
        send("TOGGLE")
      },
      onBlur(event) {
        send({ type: "TRIGGER_BLUR", target: event.relatedTarget })
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
      tabIndex: -1,
      role: "dialog",
      hidden: !isOpen,
      "data-expanded": dataAttr(isOpen),
      "aria-labelledby": rendered.title ? dom.getTitleId(state.context) : undefined,
      "aria-describedby": rendered.description ? dom.getDescriptionId(state.context) : undefined,
      "data-placement": currentPlacement,
    }),

    titleProps: normalize.element({
      ...parts.title.attrs,
      id: dom.getTitleId(state.context),
    }),

    descriptionProps: normalize.element({
      ...parts.description.attrs,
      id: dom.getDescriptionId(state.context),
    }),

    closeButtonProps: normalize.button({
      ...parts.closeButton.attrs,
      id: dom.getCloseButtonId(state.context),
      type: "button",
      "aria-label": "close",
      onClick() {
        send("REQUEST_CLOSE")
      },
    }),
  }
}
