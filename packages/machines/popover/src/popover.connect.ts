import { dataAttr, EventKeyMap, isFocusable, validateBlur } from "@zag-js/dom-utils"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./popover.dom"
import type { Send, State } from "./popover.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isOpen = state.matches("open")
  const pointerdownNode = state.context.pointerdownNode
  const currentPlacement = state.context.currentPlacement

  const popperStyles = getPlacementStyles({
    measured: !!state.context.isPlacementComplete,
    placement: currentPlacement,
  })

  return {
    portalled: state.context.currentPortalled,
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
        send("TRIGGER_CLICK")
      },
      onKeyDown(event) {
        if (event.key === "Escape") {
          send("ESCAPE")
        }
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
      "aria-labelledby": state.context.renderedElements.title ? dom.getTitleId(state.context) : undefined,
      "aria-describedby": state.context.renderedElements.description ? dom.getDescriptionId(state.context) : undefined,
      "data-placement": currentPlacement,
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
          Escape(event) {
            send("ESCAPE")
            event.stopPropagation()
          },
          Tab(event) {
            const type = event.shiftKey ? "SHIFT_TAB" : "TAB"
            send({ type, preventDefault: () => event.preventDefault() })
          },
        }

        const exec = keyMap[event.key]
        exec?.(event)
      },
      onBlur(event) {
        const isValidBlur = validateBlur(event, {
          exclude: [dom.getTriggerEl(state.context), dom.getContentEl(state.context)],
          fallback: pointerdownNode,
        })

        if (isValidBlur) {
          const el = (event.relatedTarget ?? pointerdownNode) as HTMLElement
          send({ type: "INTERACT_OUTSIDE", focusable: isFocusable(el) })
        }
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
      "aria-label": "close",
      onClick() {
        send("CLOSE")
      },
    }),
  }
}
