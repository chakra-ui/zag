import { StateMachine as S } from "@ui-machines/core"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/prop-types"
import { validateBlur } from "../utils"
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
    triggerProps: normalize.element<T>({
      id: dom.getTriggerId(ctx),
      "aria-haspopup": "dialog",
      "aria-expanded": isOpen,
      "aria-controls": dom.getContentId(ctx),
      onClick() {
        send("CLICK")
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
  }
}
