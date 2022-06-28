import { ariaAttr } from "@zag-js/dom-utils"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./dialog.dom"
import type { Send, State } from "./dialog.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const ariaLabel = state.context["aria-label"]
  const isOpen = state.matches("open")

  return {
    isOpen,
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },

    triggerProps: normalize.button({
      "data-part": "trigger",
      id: dom.getTriggerId(state.context),
      "aria-haspopup": "dialog",
      type: "button",
      "aria-expanded": isOpen,
      "aria-controls": dom.getContentId(state.context),
      onClick() {
        send("TRIGGER_CLICK")
      },
    }),

    backdropProps: normalize.element({
      "data-part": "backdrop",
      id: dom.getBackdropId(state.context),
    }),

    underlayProps: normalize.element({
      "data-part": "underlay",
      id: dom.getUnderlayId(state.context),
      onPointerDown(event) {
        if (event.target === event.currentTarget) {
          event.preventDefault()
        }
      },
      onClick(event) {
        send({ type: "UNDERLAY_CLICK", target: event.currentTarget })
        event.stopPropagation()
      },
    }),

    contentProps: normalize.element({
      "data-part": "content",
      role: state.context.role,
      id: dom.getContentId(state.context),
      tabIndex: -1,
      "aria-modal": ariaAttr(state.context.isTopMostDialog),
      "aria-label": ariaLabel || undefined,
      "aria-labelledby": ariaLabel || !state.context.isTitleRendered ? undefined : dom.getTitleId(state.context),
      "aria-describedby": state.context.isDescriptionRendered ? dom.getDescriptionId(state.context) : undefined,
      onClick(event) {
        event.stopPropagation()
      },
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
      onClick(event) {
        event.stopPropagation()
        send("CLOSE")
      },
    }),
  }
}
