import { dataAttr, isPortalEvent } from "@zag-js/dom-utils"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { isSafari } from "@zag-js/utils"
import { dom } from "./popover.dom"
import type { Send, State } from "./popover.types"

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
      "data-part": "arrow",
      style: popperStyles.arrow,
    }),

    innerArrowProps: normalize.element({
      "data-part": "arrow-inner",
      style: popperStyles.innerArrow,
    }),

    anchorProps: normalize.element({
      "data-part": "anchor",
      id: dom.getAnchorId(state.context),
    }),

    triggerProps: normalize.button({
      "data-part": "trigger",
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
      "data-part": "positioner",
      style: popperStyles.floating,
    }),

    contentProps: normalize.element({
      "data-part": "content",
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
      "data-part": "title",
      id: dom.getTitleId(state.context),
    }),

    descriptionProps: normalize.element({
      "data-part": "description",
      id: dom.getDescriptionId(state.context),
    }),

    closeButtonProps: normalize.button({
      "data-part": "close-button",
      id: dom.getCloseButtonId(state.context),
      type: "button",
      "aria-label": "close",
      onClick() {
        send("REQUEST_CLOSE")
      },
    }),
  }
}
