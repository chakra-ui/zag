import { StateMachine as S } from "@ui-machines/core"
import { validateBlur } from "@ui-machines/dom-utils/focus-event"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"

import { dom } from "./popover.dom"
import { PopoverMachineContext, PopoverMachineState } from "./popover.machine"

export function popoverConnect<T extends PropTypes = ReactPropTypes>(
  state: S.State<PopoverMachineContext, PopoverMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state
  const isOpen = state.matches("open")

  return {
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },

    triggerProps: normalize.button<T>({
      id: dom.getTriggerId(ctx),
      "aria-haspopup": "dialog",
      "aria-expanded": isOpen,
      "aria-controls": dom.getContentId(ctx),
      onClick() {
        send("TRIGGER_CLICK")
      },
    }),

    popoverProps: normalize.element<T>({
      id: dom.getContentId(ctx),
      tabIndex: -1,
      role: "dialog",
      hidden: !isOpen,
      "aria-labelledby": dom.getHeaderId(ctx),
      "aria-describedby": dom.getBodyId(ctx),
      onKeyDown(event) {
        if (event.key === "Escape") {
          send("ESCAPE")
        }
        if (event.key === "Tab") {
          send({
            type: event.shiftKey ? "SHIFT_TAB" : "TAB",
            preventDefault() {
              event.preventDefault()
            },
          })
        }
      },
      onBlur(event) {
        const isValidBlur = validateBlur(event, {
          exclude: [dom.getTriggerEl(ctx), dom.getContentEl(ctx)],
          fallback: ctx.pointerdownNode,
        })
        if (isValidBlur) {
          send("CLICK_OUTSIDE")
        }
      },
    }),

    headerProps: normalize.element<T>({
      id: dom.getHeaderId(ctx),
    }),

    bodyProps: normalize.element<T>({
      id: dom.getBodyId(ctx),
    }),

    closeButtonProps: normalize.button<T>({
      id: dom.getCloseButtonId(ctx),
      type: "button",
      "aria-label": "Close",
      onClick() {
        send("CLOSE")
      },
    }),
  }
}
