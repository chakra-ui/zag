import { StateMachine as S } from "@ui-machines/core"
import type { Props } from "../utils"
import { defaultPropNormalizer, validateBlur } from "../utils"
import { dom } from "./popover.dom"
import { PopoverMachineContext, PopoverMachineState } from "./popover.machine"

export function popoverConnect(
  state: S.State<PopoverMachineContext, PopoverMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const isOpen = state.matches("open")

  return {
    triggerProps: normalize<Props.Element>({
      id: dom.getTriggerId(ctx),
      "aria-haspopup": "dialog",
      "aria-expanded": isOpen,
      "aria-controls": dom.getContentId(ctx),
      onClick() {
        send("CLICK")
      },
    }),

    popoverProps: normalize<Props.Element>({
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

    headerProps: normalize<Props.Element>({
      id: dom.getHeaderId(ctx),
    }),

    bodyProps: normalize<Props.Element>({
      id: dom.getBodyId(ctx),
    }),
  }
}
