import { StateMachine as S } from "@ui-machines/core"
import { EventKeyMap, isFocusable, isTabbable, validateBlur } from "@ui-machines/dom-utils"
import { getArrowStyle, getFloatingStyle, getInnerArrowStyle } from "@ui-machines/popper"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./popover.dom"
import type { MachineContext, MachineState } from "./popover.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: S.State<MachineContext, MachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  void state.context.pointerdownNode

  const isOpen = state.matches("open")

  return {
    isOpen,
    portalled: state.context.__portalled,

    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },

    arrowProps: normalize.element<T>({
      id: dom.getArrowId(state.context),
      "data-part": "arrow",
      style: getArrowStyle(),
    }),

    innerArrowProps: normalize.element<T>({
      "data-part": "arrow--inner",
      style: getInnerArrowStyle(),
    }),

    anchorProps: normalize.element<T>({
      "data-part": "anchor",
      id: dom.getAnchorId(state.context),
    }),

    triggerProps: normalize.button<T>({
      "data-part": "trigger",
      "data-placement": state.context.currentPlacement,
      id: dom.getTriggerId(state.context),
      "aria-haspopup": "dialog",
      "aria-expanded": isOpen,
      "aria-controls": dom.getContentId(state.context),
      onClick() {
        send("TRIGGER_CLICK")
      },
    }),

    contentProps: normalize.element<T>({
      "data-part": "popover",
      id: dom.getContentId(state.context),
      tabIndex: -1,
      role: "dialog",
      hidden: !isOpen,
      "aria-labelledby": dom.getTitleId(state.context),
      "aria-describedby": dom.getDescriptionId(state.context),
      style: getFloatingStyle(!!state.context.currentPlacement),
      "data-placement": state.context.currentPlacement,
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
          Escape(event) {
            send("ESCAPE")
            event.stopPropagation()
          },
          Tab(event) {
            const type = event.shiftKey ? "SHIFT_TAB" : "TAB"
            send({
              type,
              preventDefault() {
                event.preventDefault()
              },
            })
          },
        }

        const exec = keyMap[event.key]
        exec?.(event)
      },
      onBlur(event) {
        const isValidBlur = validateBlur(event, {
          exclude: [dom.getTriggerEl(state.context), dom.getContentEl(state.context)],
          fallback: state.context.pointerdownNode,
        })

        const el = (event.relatedTarget ?? state.context.pointerdownNode) as HTMLElement
        const focusable = isTabbable(el) || isFocusable(el)

        if (isValidBlur) {
          send({ type: "INTERACT_OUTSIDE", focusable })
        }
      },
    }),

    titleProps: normalize.element<T>({
      "data-part": "header",
      id: dom.getTitleId(state.context),
    }),

    descriptionProps: normalize.element<T>({
      "data-part": "body",
      id: dom.getDescriptionId(state.context),
    }),

    closeButtonProps: normalize.button<T>({
      "data-part": "close-button",
      id: dom.getCloseButtonId(state.context),
      type: "button",
      "aria-label": "Close",
      onClick() {
        send("CLOSE")
      },
    }),
  }
}
